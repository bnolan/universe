var SimplePeer = require('simple-peer');

var peer1 = new SimplePeer({ initiator: true });

peer1.on('signal', function (data) {
  window.d = data;
  console.log(data.toString());
});
