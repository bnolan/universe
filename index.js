var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');

var Backbone = require('backbone');

var Feed = require('./src/feed');
var Settings = require('./src/settings');
var User = require('./src/user');
var Myself = require('./src/myself');
var postMessage = require('./src/post-message');

var db = level('./mydb2');

var myself = Myself();

var feed = {
  name: 'Mr Peabody',
  posts: []
};

var PostModel = Backbone.Model.extend({
});

var PostCollection = Backbone.Collection.extend({
  model: PostModel
});

window.posts = new PostCollection();

if (myself) {
  var posts = window.posts;

  function render () {
    React.render(
      <div>
        <Settings data={myself} />
        <Feed name={myself.name} posts={posts} />
      </div>,
      document.getElementById('main_container')
    );
  }

  posts.on('add', function () {
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
  React.render(
    <div>
      <Settings />
    </div>,
    document.getElementById('main_container')
  );
}
