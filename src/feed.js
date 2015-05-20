var React = require('react');
var Post = require('./post');

module.exports = React.createClass({
  displayName: 'Feed',

  propTypes: {
    name: React.PropTypes.string,
    posts: React.PropTypes.array
  },

  render: function () {
    var posts = this.props.posts;

    return (
      <div>
        <h1>The universe page for {this.props.name}</h1>

        {posts.map(function (result) {
          return (
            <Post author={result.author} content={result.content} createdAt={result.createdAt} />
          );
        })}
      </div>
    );
  }
});
