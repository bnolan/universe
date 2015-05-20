var SimplePeer = require('simple-peer');
var React = require('react');
var Feed = require('./src/feed');

var peer1 = new SimplePeer({ initiator: true });

window.deets = [];

peer1.on('signal', function (data) {
  console.log(data);
  window.deets.push(data);
});

var feed = {
  name: 'Mr Peabody',
  posts: [
    { content: 'hello world', createdAt: new Date().getTime(), author: { name: 'Mr Snow'}}
  ]
};

React.render(
  <Feed name={feed.name} posts={feed.posts} />,
  document.getElementById('main')
);
