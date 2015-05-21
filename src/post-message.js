var uuid = require('uuid');
var level = require('level-browserify');
var db = level('./mydb2');

module.exports = function (message) {
  var createdAt = (new Date()).getTime();
  message.createdAt = createdAt;
  message.id = uuid.v1();
  db.put(message.id, JSON.stringify(message));
};
