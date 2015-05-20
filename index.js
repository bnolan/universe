var SimplePeer = require('simple-peer');
var React = require('react');
var Feed = require('./src/feed');

var peer1 = new SimplePeer({ initiator: true });

window.deets = [];

peer1.on('signal', function (data) {
  console.log(data);
  window.deets.push(data);
});

React.render(
  <Feed name='Mr Peabody' />,
  document.getElementById('main')
);
