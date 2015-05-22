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
      return post.get('author').pkf === author.get('pkf');
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


$('body').addClass('loading');

var Workspace = Backbone.Router.extend({

  routes: {
    'logout': 'logout',
    '': 'feed',  
    "friend/:pkf": "showFriend"   
  },

  logout: function () {
    Myself.logout();
    window.location.hash = "";
    window.location.reload();
  },

  feed: function () {
    start();
  },

  showFriend: function(pkf) {
    var friends = window.friends;

    friends.get(pkf)

    React.render(<Feed />, document.getElementById('main_container'));

    // ....
  }
});

$(function () {
  var workspace = new Workspace();
  Backbone.history.start({pushState: false});
});

// dont judge me
window.posts = new PostCollection();
window.friends = new FriendCollection();
window.peers = {};

// dont judge me either
$('.sk-spinner').remove();
$('body').removeClass('loading');
$('header').show();
$('header').addClass('animate-header');

function start () {
  if (!myself.isValid()) {
    React.render(<div><h1>Initial setup</h1><Settings /></div>, document.getElementById('main_container'));
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
    posts.whereAuthor(myself).forEach(function (post) {
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

