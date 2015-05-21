// var fingerprint = require('./fingerprint');
var Backbone = require('backbone');

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
  }
});

User.fromName = function (name) {
  return new User({
    pkf: name, // fingerprint(name),
    name: name
  });
};

module.exports = User;
