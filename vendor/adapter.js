var sublevel = require('level-sublevel');
var uuid = require('node-uuid');
var _ = require('underscore');
var Promise = require('bluebird');

var sub;

var Adapter = function (Backbone, config) {
	// Sets sublevel database at backbone level
	var db  = config.db;
	Backbone.db = sub = sublevel(db);

	Backbone.sync = function (method, entity, options) {
		var deferred = Promise.pending();

		var success = options.success;
		options.success = function(resp) {
			if (success) success(resp);
			deferred.resolve(resp);
			entity.trigger('sync', entity, resp, options);
		};

		var error = options.error;
		options.error = function(resp) {
			if (error) error(resp);
			deferred.reject(resp);
			entity.trigger('error', entity, resp, options);
		};

		if(entity instanceof Backbone.Collection){
			var collection = entity;

			if(method === 'read'){
				var readStream = collection._db.createReadStream();
				var models = [];

				readStream.on('data', function(data){
					data.value.id = data.key;

					if(options.filter && options.filter(data.value)){
						collection.add(data.value);
						models.push(data.value);
					}else if(!options.filter){
						collection.add(data.value);
						models.push(data.value);
					}
				})
				.on('end', function(){
					options.success(models);
				})
				.on('error', function(err){
					options.error(err);
				});
			}
		}

		else if(entity instanceof Backbone.Model){
			console.log('model ' + method);

			var model = entity;
			model._db = model.collection._db;

			var modelAsJSON = model.toJSON();
			delete modelAsJSON.id;
			var dbPut = Promise.promisify(model._db.put, model._db),
				dbDel = Promise.promisify(model._db.del, model._db);

			if(method === 'create'){
				var id = uuid.v1();
				dbPut(id, modelAsJSON).then(function() {
					model.set('id', id);
					options.success(model);
				}, options.error);
			}else if(method === 'update'){
				dbPut(model.get(model.idAttribute), modelAsJSON)
				.then(options.success.bind(null, model), options.error);

			}else if(method === 'delete'){
				//implement

				dbDel(model.get('id'))
				.then(options.success.bind(null, model), options.error);
			}
		} else {
			console.log('wtf?');
			console.log(entity);
		}
		return deferred.promise;
	};

	Adapter.CollectionOverwrite(Backbone.Collection);
	Adapter.ModelOverwrite(Backbone.Model);
};

Adapter.CollectionOverwrite = function (Collection) {
	Collection.oldExtend = Collection.extend;

	Collection.extend = function (object) {
		var result = Collection.oldExtend.apply(this, arguments);

		result.prototype.isCollection = true;

		if(object.dbName){
			result.prototype._db = sub.sublevel(object.dbName);


			result.prototype.nuke = function (callback) {
				var collection = this;

				var opts = [];

				collection._db.createKeyStream().on('data', function(key){
					opts.push({type:'del', key:key});
				})
				.on('end', function(err){
					if(err){
						callback(err);
						return;
					}

					collection._db.batch(opts, function (err) {
						callback(err);
					});
				})
				.on('error', function(err){
					console.log('There as an error', err);
					callback(err);
				});
			};

			result.prototype.fetchFilter = function (fn) {
				if( !_.isFunction(fn) ){
					var queryObject = fn;
					fn = function (data) {
						var pass = true;

						_.each(queryObject, function (value, key) {
							if( !(_.has(data,key) && data[key] === value) ){
								pass = false;
							}
						});

						return pass;
					};
				}

				return this.fetch({filter : fn});
			};

			result.prototype.fetchOne = function (query) {
				return this.model.find(query);
			};
		}

		return result;
	};

	Collection.fetch = function(callback){
		var collection = new this();

		var q = collection.fetch();
		q.done(function(){
			collection.trigger('ready');
			if(callback){callback(null, collection);}
		});

		return collection;
	};

	Collection.findOne = function(queryObject, callback){
		return this.prototype.fetchOne(queryObject, callback).nodeify(callback);
	};

	Collection.find = function(queryObject, callback){
		var collection = new this();

		var q = collection.fetchFilter(queryObject);
		q.done(function(){
			collection.trigger('ready');
			if(callback){callback(null, collection);}
		});

		return collection;
	};
};

Adapter.ModelOverwrite = function (Model) {
	Model.defaultUniqueKey = function() {
		return uuid.v1();
	};

	if (!Model.oldExtend) {
		Model.oldExtend = Model.extend;
	}

	Model.extend = function (object) {
		var result = Model.oldExtend.apply(this, arguments);

		result.prototype.isModel = true;

		if(object.dbName){
			var collection = sub.sublevel(object.dbName);

			result.dbName = object.dbName;
			result._db = collection;
			result.prototype._db = collection;
		}

		if (_.isString(object.uniqueKey)){
			var key = object.uniqueKey;
			result.prototype.uniqueKey = function() {
				var result = this.get(key);
				//TODO fallar cuando esto regrese null/undefined
				return result;
			};
		} else if (_.isFunction(object.uniqueKey)){
			result.prototype.uniqueKey = object.uniqueKey;
		} else {
			result.prototype.uniqueKey = Model.defaultUniqueKey;
		}

		return result;
	};

	Model.find = function (query, callback) {
		var Self = this,
			models = [];

		// Special casing for performance: if query is a String, then we assume
		// that the key passed is the actual key stored in the db
		if (_.isString(query)) {
			return Self.get(query, callback);
		}

		var deferred = Promise.pending();

		var readStream = this._db.createReadStream();

		readStream.on('data', function(data){
			var pass;
			if(_.isFunction(query)){
				pass = query(data.value);
			}else if(_.isString(query)) {
			}else if(_.isObject(query)){
				pass = true;

				_.each(query, function (value, key) {
					if( !(_.has(data.value,key) && data.value[key] === value) ){
						pass = false;
					}
				});

			}else{
				pass = false;
			}

			if(pass){
				data.value.id = data.key;
				models.push(data.value);
			}

		})
		.on('end', function(){
			if(models.length === 1){
				var model = new Self(models[0]);
				deferred.resolve(model);
			}else if(models.length > 1){
				deferred.reject(new Error('too many models in find'));
			}else{
				deferred.resolve();
			}
		})
		.on('error', function(err){
			deferred.reject(err);
		});
		return deferred.promise.nodeify(callback);
	};

	Model.get = function (id, callback) {
		var Self = this,
			_get = Promise.promisify(this._db.get, this._db);

		return _get(id).then(function(data) {
			data.id = id;
			return new Self(data);
		}).nodeify(callback);
	};
};

module.exports = Adapter;
