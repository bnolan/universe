var SimplePeer = require('simple-peer');
var React = require('react');
var level = require('level-browserify');
var SignalHub = require('signalhub');

var Feed = require('./src/feed');
var Settings = require('./src/settings');
var User = require('./src/user');
var Myself = require('./src/myself');
var postMessage = require('./src/post-message');


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
    var initiator = data.initiator;
    var newPeer;

    if (friend == myself.name) {
      console.log('got a message from myself');
      return;
    }

    if (peers[friend]) {
      console.log("Found existing peer ", friend);
      if (initiator && peers[friend].initiator) {
        console.log("Received intiator connection from", friend, ", cleaning up old initiator connection");
        delete peers[friend];
      } else {
        console.log("Received non initiator connection from", friend, ", using existing peer");
        newPeer = peers[friend];
      };
    }

    if (!newPeer) {
      console.log("Created new peer for ", friend);
      peers[friend] = newPeer = new SimplePeer();

      newPeer.on('error', function (err) { console.log(friend, 'error', err) });

      newPeer.on('connect', function () {
        console.log('CONNECT');
      });

      newPeer.on('data', function (data) {
        console.log('data: ' + data);
      });
      
      newPeer.on('signal', function (data) {
        console.log('sending a', !initiator ? 'initiator' : 'non-initiator', 'response to', friend);
        hub.broadcast('/' + friend, JSON.stringify({name: myself.name, data: data, initiator: !initiator}));
      });
    }

    newPeer.signal(signallingData);
  };

  console.log('Subscribing to my own signalhub');
  hub.subscribe('/' + myself.name)
    .on('data', function (data) {
      var initiator = JSON.parse(data).initiator;
      console.log(initiator ? 'Signal' : 'Response', 'in my channel from ' + JSON.parse(data).name);
      registerPeer(JSON.parse(data));
    });

  console.log('Creating peers and publishing to signalhub for', friends.join(', '));
  friends.forEach(function (friend) {
    var peer = new SimplePeer( { initiator: true });
    peer.on('signal', function (data) {
      console.log('sending a initiator signal to', friend);
      hub.broadcast('/' + friend, JSON.stringify({name: myself.name, data: data, initiator: true}));
    });

    peer.on('error', function (err) { console.log(friend, 'error', err) });

    peer.on('connect', function () {
      console.log('CONNECT');
    });

    peer.on('data', function (data) {
      console.log('data: ' + data);
    });

    peers[friend] = peer;
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
