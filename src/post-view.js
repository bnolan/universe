/* globals $ */

var React = require('react');
var timeago = require('timeago');

module.exports = React.createClass({
  displayName: 'PostView',

  componentDidMount: function () {
    $(this.getDOMNode()).embedly({
      query: { maxwidth: 500 },
      key: '90eb0b46c1e146e5afbbe0279e77866b'
    });
  },

  render: function () {
    var content = this.props.data.content.replace(/(http\S+)/, '<a href="$1">$1</a>');

    return (
      <div className='post'>
        <h3 className='author'>
          {this.props.data.author.name}
        </h3>
        <div className='content' dangerouslySetInnerHTML={{__html: content}} />
        <small>{ timeago(this.props.data.createdAt) }</small>
      </div>
    );
  }
});
