var React = require('react');
var timeago = require('timeago');

module.exports = React.createClass({
  displayName: 'PostView',

  render: function () {
    return (
      <div className='post'>
        <h3 className='author'>
          {this.props.data.author.name}
        </h3>
        <div className='content'>
          { this.props.data.content }
        </div>
        <small>{ timeago(this.props.data.createdAt) }</small>
      </div>
    );
  }
});
