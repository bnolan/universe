var uuid = require('uuid');
var level = require('level-browserify');
var db = level('./mydb2');
var PostModel = require('./post-model');

module.exports = function (message) {
  var createdAt = (new Date()).getTime();
  message.createdAt = createdAt;

  if (!message.author) {
    throw new Error('Invalid post, no author.');
  }

  window.posts.create(new PostModel(message));
  // db.put(message.id, JSON.stringify(message));
};
