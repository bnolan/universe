var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');
var SignalHub = require('signalhub');

var Feed = require('./src/feed');
var Settings = require('./src/settings');
var User = require('./src/user');
var Myself = require('./src/myself');
var postMessage = require('./src/post-message');
var UserDetails = require('./src/user-details');


var db = level('./mydb2');

var myself = Myself();

var hub = SignalHub(
  '192.155.85.161:9010',
  'universe'
);

var feed = {
  name: 'Mr Peabody',
  posts: []
};

if (myself) {
  var myPeer = new SimplePeer({ initiator: true, trickle: false });

  myPeer.on('signal', function(data) {
    console.log('Peer js connection opened, registering with signalhub');
    hub.broadcast('/' + myself.name, JSON.stringify({name: myself.name, data: data}));
  });

  myPeer.on('error', function (err) { console.log('error', err) });

  myPeer.on('data', function (data) {
    console.log('data: ' + data);
  });

  var friends = [
    'nick',
    'kelly',
    'ben',
    'matt',
  ].filter(function(friend) { return friend != myself.name; });

  window.peers = {};

  var registerPeer = function (data) {
    var friend = data.name;
    var signallingData = data.data;
    var newPeer;

    if (friend == myself.name) {
      return;
    }

    console.log(friend, signallingData);

    if (peers[friend]) {
      console.log("Found existing peer ", friend);
      newPeer = peers[friend];
    } else {
      console.log("Created new peer for ", friend);
      peers[friend] = newPeer = new SimplePeer();

      newPeer.on('error', function (err) { console.log('error', err) });

      newPeer.on('connect', function () {
        console.log('CONNECT');
        newPeer.send('whatever' + Math.random());
      });

      newPeer.on('data', function (data) {
        console.log('data: ' + data);
      });
      
      newPeer.on('signal', function (data) {
        console.log('got a peering signal from ' + friend + ', sending data to #' + friend);
        hub.broadcast('/' + friend, JSON.stringify({name: myself.name, data: data}));
      });
    }

    newPeer.signal(signallingData);
  };

  console.log('Subscribing to my own signalhub');
  hub.subscribe('/' + myself.name)
    .on('data', function (data) {
      console.log('Signal in my channel from ' + JSON.parse(data).name);
      registerPeer(JSON.parse(data));
    });

  console.log('Subcribing to signalhub for', friends.join(', '));
  friends.forEach(function (friend) {
    hub.subscribe('/' + friend)
      .on('data', function (data) {
        console.log('got a signal from ' + friend + ' in #' + friend);
        registerPeer(JSON.parse(data));
      });
  });

  window.sendMessage = function (message) {
    for (peer in peers) {
      var connection = peers[peer];
      connection.send(message);
    }
  };
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
        document.getElementById('main')
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
      document.getElementById('main')
      );
}
