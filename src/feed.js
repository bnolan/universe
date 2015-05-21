var React = require('react');
var PostView = require('./post-view');
var PostForm = require('./post-form');

module.exports = React.createClass({
  displayName: 'Feed',

  propTypes: {
    name: React.PropTypes.string,
    posts: React.PropTypes.object
  },

  render: function () {
    return (
      <div>
        <h1>{this.props.name}</h1>

        <PostForm />

        {this.props.posts.map(function (result) {
          return <PostView key={result.id} data={result.attributes} />;
        })}
      </div>
    );
  }
});
