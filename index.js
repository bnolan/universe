var React = require('react');
var level = require('level-browserify');
var Backbone = require('backbone');

var Settings = require('./src/settings');
var Myself = require('./src/myself');
var User = require('./src/user');

var PageView = require('./src/page-view');
var Myself = require('./src/myself');
var PostModel = require('./src/post-model');

var signalling = require('./src/signalling');

var db = level('./mydb2');
var myself = Myself();

var PostCollection = Backbone.Collection.extend({
  model: PostModel
});

// dont judge me
window.posts = new PostCollection();
window.peers = {};

function start () {
  if (!myself) {
    React.render(<Settings />, document.getElementById('main_container'));
    return;
  }

  var friends = [
    'nick',
    'kelly',
    'ben',
    'matt'
  ].filter(function (name) {
    return name !== myself.name;
  }).map(function (name) {
    return User.fromName(name);
  });

  var peers = window.peers;
  var posts = window.posts;

  signalling.subscribe();
  signalling.registerWithFriends(friends.map(function (friend) {
    return friend.pkf;
  }));

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

  db.createReadStream()
    .on('data', function (data) {
      var post;

      try {
        post = new PostModel(JSON.parse(data.value));
      }catch (e) {
        return;
      }

      posts.add(post);
    });

  render();
}

start();