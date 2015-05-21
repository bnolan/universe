var SignalHub = require('signalhub');
var SimplePeer = require('simple-peer');
var myself = require('./myself')();
var postMessage = require('./post-message');

var hub = SignalHub(
    '192.155.85.161:9010',
    'universe'
    );

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
      postMessage(data);
    });

    newPeer.on('signal', function (data) {
      console.log('sending a', !initiator ? 'initiator' : 'non-initiator', 'response to', friend);
      hub.broadcast('/' + friend, JSON.stringify({name: myself.name, data: data, initiator: !initiator}));
    });
  }

  newPeer.signal(signallingData);
};



var Signalling = {
  subscribe: function () {
    console.log('Subscribing to my own signalhub');
    hub.subscribe('/' + myself.name)
      .on('data', function (data) {
        var initiator = JSON.parse(data).initiator;
        console.log(initiator ? 'Signal' : 'Response', 'in my channel from ' + JSON.parse(data).name);
        registerPeer(JSON.parse(data));
      });
  },

  registerWithFriends: function (friends) {
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
        postMessage(data);
      });

      peers[friend] = peer;
    });
  }
};

module.exports = Signalling;
