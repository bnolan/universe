var React = require('react');

module.exports = React.createClass({
  displayName: 'Post',

  render: function () {
    return (
      <div className='post'>
        <h3 className='postAuthor'>
          {this.props.data.author.name}
        </h3>
        { this.props.data.content }
        <small>{ this.props.data.createdAt }</small>
      </div>
    );
  }
});
