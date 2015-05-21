var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');

var Feed = require('./src/feed');
var Settings = require('./src/settings');
var User = require('./src/user');
var Myself = require('./src/myself');
var postMessage = require('./src/post-message');

var db = level('./mydb2');

var myself = Myself();

var Nav = require('./src/thing');

var feed = {
  name: 'Mr Peabody',
  posts: []
};

if (myself) {
  var post = {
    author: Myself().toJson(),
    content: 'Hello world this is great'
  };

  postMessage(post);

  function render() {
    React.render(
      <div>
        <Settings data={myself} />
        <Feed name={myself.name} posts={feed.posts} />
      </div>,
      document.getElementById('main_container')
    );
  }

  db.createReadStream()
    .on('data', function (data) {
      var post;

      try {
        post = JSON.parse(data.value);
      }catch (e) {
        return;
      }

      if ((post.author) && (post.author.pkf === myself.pkf)) {
        myself.posts.push(post);
        feed.posts.push(post);

        render();
      }
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
