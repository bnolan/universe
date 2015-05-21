// var fingerprint = require('./fingerprint');
var Backbone = require('backbone');

var User = Backbone.Model.extend({
});

User.fromName = function (name) {
  return new User({
    pkf: name, // fingerprint(name),
    name: name
  });
};

module.exports = User;
