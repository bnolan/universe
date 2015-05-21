///////////////////////////////////////////////////////////////////
//                                                               //
// Impotant Notice                                               //
//                                                               //
// This is a utility file to fill, list and nuke the database    //
// This is not part of the adapter, just a nice to have utility. //
//                                                               //
///////////////////////////////////////////////////////////////////
var level = require('level');
var sublevel = require('level-sublevel');

var db = level('../testDb', { valueEncoding: 'json' });
var subleveledDb = sublevel(db);
var collection = subleveledDb.sublevel('example');

var action = process.argv[2];

if(action === 'list'){
	console.log('Action: List');

	collection.createReadStream().on('data', function(data){
		console.log('Got:',data);
	})
	.on('end', function(){
		console.log('Finish query');
		db.close();
	})
	.on('error', function(err){
		console.log('There as an error', err);
	});
}else if(action === 'fill'){
	console.log('Action: Fill');

	var data = [
		{ type : 'put', key: 'Peyton Manning',		value : { name : 'Peyton Manning'   ,completed : 286,attempts : 409,tds : 34,team : 'DEN' ,active : true  } },
		{ type : 'put', key: 'Drew Brees',			value : { name : 'Drew Brees'       ,completed : 277,attempts : 406,tds : 26,team : 'NO'  ,active : true  } },
		{ type : 'put', key: 'Matthew Stafford',	value : { name : 'Matthew Stafford' ,completed : 248,attempts : 419,tds : 21,team : 'DET' ,active : true  } },
		{ type : 'put', key: 'Aaron Rodgers,',		value : { name : 'Aaron Rodgers,'   ,completed : 168,attempts : 251,tds : 15,team : 'GB'  ,active : false } },
	];

	collection.batch(data, function (err) {
		if (err) return console.log('Ooops!', err);
		console.log('Db is ready to play!');

		db.close();
	});
}else if(action === 'nuke'){
	var opts = [];

	collection.createKeyStream().on('data', function(key){
		console.log('Key:',key);
		opts.push({type:'del', key:key});
	})
	.on('end', function(){
		console.log('Finish collecting ');

		collection.batch(opts, function () {
			console.log('Nuked!');
			db.close();
		});
	})
	.on('error', function(err){
		console.log('There as an error', err);
	});
}else{
	console.log('Use commands list|fill|nuke');
}


