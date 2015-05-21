var React = require('react');
var postMessage = require('./post-message');
var User = require('./user')

module.exports = React.createClass({
  displayName: 'PostForm',

  handleSubmit: function (e) {
    e.preventDefault();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content) {
      return;
    }

    React.findDOMNode(this.refs.content).value = '';
    var myself = new User({
      name: 'Ben Nolan',
      pkf: '12:12:12:...'
    });
    var post = {
      author: myself.toJson(),
      content: content
    };
    postMessage(post);
  },

  render: function () {
    return (
      <form className='postForm' onSubmit={this.handleSubmit}>
        <h3>New Post</h3>
        <textarea placeholder='Say something...' ref='content' /><br />
        <input type='submit' value='Post' className="btn" />
      </form>
    );
  }
});
