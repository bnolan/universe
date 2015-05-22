var uuid = require('uuid');
var level = require('level-browserify');
var db = level('./mydb2');
var PostModel = require('./post-model');
var CommentModel = require('./comment-model');

module.exports = function (type, message) {
  var createdAt = (new Date()).getTime();
  message.createdAt = createdAt;

  if (!message.author) {
    throw new Error('Invalid post, no author.');
  }

  if (type === 'Post') {
    window.posts.create(new PostModel(message));
  } else {
    window.comments.create(new CommentModel(message));
  }
  // db.put(message.id, JSON.stringify(message));
};
