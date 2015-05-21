var React = require('react');
var level = require('level-browserify');
var Backbone = require('backbone');
var levelDbBackboneAdapter = require('./vendor/adapter');

var Settings = require('./src/settings');
var Myself = require('./src/myself');
var User = require('./src/user');

var PageView = require('./src/page-view');
var Myself = require('./src/myself');
var PostModel = require('./src/post-model');

var signalling = require('./src/signalling');

var db = level('./mydb2', { valueEncoding: 'json' });
var myself = Myself();

levelDbBackboneAdapter(Backbone, { db: db });

var PostCollection = Backbone.Collection.extend({
  model: PostModel,
  dbName: 'Posts'
});

var FriendCollection = Backbone.Collection.extend({
  model: User,
  dbName: 'Friends',

  getPkfs: function () {
    return this.map(function (friend) {
      return friend.get('pkf');
    });
  },

  prepopulate: function () {
    var self = this;

    console.log('prepopulate');

    ['nick', 'kelly', 'ben', 'matt'].filter(function (name) {
      return name !== myself.name;
    }).forEach(function (name) {
      var user = User.fromName(name);
      self.create(user);
    });
  }
});

// dont judge me
window.posts = new PostCollection();
window.friends = new FriendCollection();
window.peers = {};

function start () {
  if (!myself) {
    React.render(<Settings />, document.getElementById('main_container'));
    return;
  }

  var peers = window.peers;
  var posts = window.posts;
  var friends = window.friends;

  friends.fetch().then(function () {
    if (friends.isEmpty()) {
      friends.prepopulate();
    }
  });

  posts.fetch().then(function () {
    render();
  });

  signalling.subscribe();
  signalling.registerWithFriends(friends.getPkfs());

  window.sendMessage = function (message) {
    for (var peer in peers) {
      var connection = peers[peer];
      connection.send(message);
    }
  };

  function render () {
    React.render(<PageView />, document.getElementById('main_container'));
  }

  posts.on('add', function (post) {
    render();
  });

  render();
}

start();