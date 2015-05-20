
var React = require('react');

module.exports = React.createClass({
  displayName: 'Feed',

  propTypes: {
    name: React.PropTypes.string
  },

  render: function () {
    return (
      <div>
        <h1>The universe page for {this.props.name}</h1>
      </div>
    );
  }
});
