var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');
var Backbone = require('backbone');
var PageView = require('./src/page-view');
var Myself = require('./src/myself');
var PostModel = require('./src/post-model');
var db = level('./mydb2');
var myself = Myself();

var PostCollection = Backbone.Collection.extend({
  model: PostModel
});

window.posts = new PostCollection();

if (myself) {
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
