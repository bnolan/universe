var React = require('react');

module.exports = React.createClass({
  displayName: 'PostForm',

  handleSubmit: function (e) {
    e.preventDefault();
    var content = React.findDOMNode(this.refs.content).value.trim();
    if (!content) {
      return;
    }
    // TODO: send request
    React.findDOMNode(this.refs.content).value = '';
    console.log(content);
  },

  render: function () {
    return (
      <form className='postForm' onSubmit={this.handleSubmit}>
        <h3>New Post</h3>
        <textarea placeholder='Say something...' ref='content' /><br />
        <input type='submit' value='Post' />
      </form>
    );
  }
});
