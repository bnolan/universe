var React = require('react');
var postMessage = require('./post-message');
var User = require('./user');
var Myself = require('./myself');

module.exports = React.createClass({
  displayName: 'PostForm',

  createOnEnter: function (e) {
    var enterKey = 13;

    if (e.which === enterKey) {
      this.handleSubmit(e);
    }
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content) {
      return;
    }

    React.findDOMNode(this.refs.content).value = '';
    var myself = Myself();

    var post = {
      author: myself.toJson(),
      content: content
    };

    postMessage(post);
  },

  render: function () {
    return (
      <form className='post-form' onSubmit={this.handleSubmit} onKeyPress={this.createOnEnter}>
        <h3>New Post</h3>
        <textarea placeholder='Say something...' ref='content' /><br />
        <input type='submit' value='Post' />
      </form>
    );
  }
});
