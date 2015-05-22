/* globals $ */

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
  dbName: 'Posts',

  whereAuthor: function (author) {
    return this.filter(function (post) {
      return post.author.pkf === author.pkf;
    });
  }
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
      return name !== myself.get('name');
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

$('.sk-spinner').remove();
$('header').show();

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

    signalling.subscribe();
    signalling.registerWithFriends(friends.getPkfs());
  });

  posts.fetch().then(function () {
    render();
  });

  signalling.on('connect', function (peer) {
    posts.whereAuthor(myself).each(function (post) {
      peer.send(post.toJSON());
    });
  });

  cleanUpDeadPeers = function () {
    var deadPeers = [];
    var connection;

    for (var peer in peers) {
      connection = peers[peer];
      if (!connection._channel) {
        deadPeers.push(peer);
      }
    }

    deadPeers.forEach(function(peer) { delete peers[peer]; });
  };

  window.sendMessage = function (message) {
    cleanUpDeadPeers();

    for (var peer in peers) {
      var connection = peers[peer];

      if (connection._channel.readyState === 'open') {
        connection.send(message);
      }
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
