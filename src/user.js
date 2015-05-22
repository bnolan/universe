var fingerprint = require('./fingerprint');
var Backbone = require('backbone');
var NodeRSA = require('node-rsa');

var User = Backbone.Model.extend({
  validate: function(attrs, options) {
    if (!attrs.name) {
      return 'must have a name';
    }

    if (!attrs.pkf) {
      return 'must have a pkf';
    }

    if (!attrs.pkf.match(/:/)) {
      return 'pkf doesnt look valid';
    }
  },

  generateKeys: function () {
    var key = new NodeRSA({b: 512});

    this.set({
      publicKey: key.exportKey('pkcs8-public'),
      privateKey: key.exportKey('pkcs8-private'),
      pkf: fingerprint(key.exportKey('pkcs8-public'), 'sha1')
    });
  },

  isOnline: function () {
    var peers = window.peers;

    for (var pkf in peers) {
      if ((pkf === this.get('pkf')) && (peers[pkf]._channel.readyState === 'open')) {
        return true;
      }
    }

    return false;
  }
});

User.fromName = function (name) {
  return new User({
    pkf: name, // fingerprint(name),
    name: name
  });
};

module.exports = User;
