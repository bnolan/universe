var SimplePeer = require('simple-peer');
var React = require('react');
var uuid = require('uuid');
var level = require('level-browserify');

var Feed = require('./src/feed');
var User = require('./src/user');

var db = level('./mydb2');

var postMessage = function (message) {
  var createdAt = (new Date).getTime();
  message.createdAt = createdAt;
  message.id = uuid.v1();
  db.put(message.id, JSON.stringify(message));
};

var myself = new User({
  name: 'Ben Nolan',
  pkf: '12:12:12:...'
});

var post = {
  author: myself.toJson(),
  content: 'Hello world this is great'
};
postMessage(post);

var feed = {
  name: 'Mr Peabody',
  posts: []
};

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

      console.log('eh?');

      render();
    }
  });

function render() {
  React.render(
    <Feed name={myself.name} posts={feed.posts} />,
    document.getElementById('main')
  );
}

render();