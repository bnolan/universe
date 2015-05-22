/* global peers */

var _ = require('underscore');
var Backbone = require('backbone');
var SignalHub = require('signalhub');
var SimplePeer = require('simple-peer');
var myself = require('./myself')();
var postMessage = require('./post-message');

var hub = SignalHub(
  '192.155.85.161:9010',
  'universe'
);

var myPkf = (myself && myself.get('pkf'));

var constructPeer = function (pkf, initiator) {
  var friend = window.friends.findByPkf(pkf);

  if (!friend) {
    console.log('Construct Peer from non-friend. Abort!');
    return;
  }

  var newPeer = new SimplePeer({ trickle: false, initiator: initiator });

  newPeer.on('error', function (err) { console.log(friend.get('name'), 'error', err); });

  newPeer.on('connect', function () {
    console.log('Connected to', friend.get('name'));

    Signalling.trigger('connect', newPeer);
  });

  newPeer.on('data', function (data) {
    console.log('Got a message from', friend.get('name'), ':', data);

    Signalling.trigger('data', newPeer);

    postMessage('Post', data);
  });

  newPeer.on('signal', function (data) {
    console.log('Sending a', initiator ? 'initiator' : 'non-initiator', 'response to', friend.get('name'));

    Signalling.trigger('signal', newPeer);

    hub.broadcast(pkf, JSON.stringify({pkf: myPkf, data: data, initiator: initiator}));
  });

  return newPeer;
};

var registerPeer = function (data) {
  var pkf = data.pkf;
  var friend = window.friends.findByPkf(pkf);

  var signallingData = data.data;
  var initiator = data.initiator;
  var newPeer;

  if (pkf === myPkf) {
    console.log('got a message from myself');
    return;
  }

  if (peers[pkf]) {
    if (initiator) {
      console.log("Received intiator connection from", friend.get('name'), ", cleaning up old connection");
      delete peers[pkf];
    } else if (peers[pkf].initiator === false) {
      console.log("Received intiator connection from", friend.get('name'), ", cleaning up old non-initiator connection");
      delete peers[pkf];
    }

    if (peers[pkf]) {
      newPeer = peers[pkf];
    }
  }

  if (!newPeer) {
    console.log('Created new peer for', friend.get('name'));
    peers[pkf] = newPeer = constructPeer(pkf, !initiator);
  }

  newPeer.signal(signallingData);
};

var Signalling = {
  subscribe: function () {
    console.log('Subscribing to my own signalhub');
    hub.subscribe(myPkf)
      .on('data', function (data) {
        var initiator = JSON.parse(data).initiator;
        console.log(initiator ? 'Signal' : 'Response', 'in my channel from ' + JSON.parse(data).pkf);
        registerPeer(JSON.parse(data));
      });
  },

  registerWithFriends: function (friends) {
    console.log('Creating peers and publishing to signalhub for', friends.join(', '));
    friends.forEach(function (friend) {
      peers[friend] = constructPeer(friend, true);
    });
  }
};

_.extend(Signalling, Backbone.Events);

module.exports = Signalling;
