var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');
var Backbone = require('backbone');

var Feed = require('./src/feed');
var Settings = require('./src/settings');
var User = require('./src/user');
var Myself = require('./src/myself');
var postMessage = require('./src/post-message');

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
window.$ = window.jQuery = jQuery;
window.posts = new PostCollection();

if (myself) {
  var friends = [
    'nick',
    'kelly',
    'ben',
    'matt',
  ].filter(function(friend) { return friend != myself.name; });

  window.peers = {};

  signalling.subscribe();
  signalling.registerWithFriends(friends);

  window.sendMessage = function (message) {
    for (var peer in peers) {
      var connection = peers[peer];
      connection.send(message);
    }
  };

  var posts = window.posts;

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
} else {
  React.render(<Settings />, document.getElementById('main_container'));
}
