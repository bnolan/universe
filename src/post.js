var React = require('react');

module.exports = React.createClass({
  displayName: 'Post',

  propTypes: {
    author: React.PropTypes.object,
    content: React.PropTypes.string,
    createdAt: React.PropTypes.string
  },

  render: function () {
    return (
      <div className='post'>
        <h3 className='postAuthor'>
          {this.props.author.name}
        </h3>
        { this.props.content }
        <small>{ this.props.createdAt }</small>
      </div>
    );
  }
});
