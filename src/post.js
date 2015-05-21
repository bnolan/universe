var React = require('react');

module.exports = React.createClass({
  displayName: 'Post',

  render: function () {
    return (
      <div className='post'>
        <h3 className='author'>
          {this.props.data.author.name}
        </h3>
        <div className='content'>
          { this.props.data.content }
        </div>
        <small>{ this.props.data.createdAt }</small>
      </div>
    );
  }
});
