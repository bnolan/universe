var _ = require('underscore');
var fingerprint = require('./fingerprint');

function User (args) {
  _.assign(this, args);
  this.posts = [];
};

User.prototype.toJson = function () {
  return { name: this.name, pkf: this.pkf };
};

User.fromName = function (name) {
  return new User({
    pkf: fingerprint(name),
    name: name
  });
};

module.exports = User;
