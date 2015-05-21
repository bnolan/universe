var React = require('react');
var Post = require('./post');
var PostForm = require('./post-form');

module.exports = React.createClass({
  displayName: 'Feed',

  propTypes: {
    name: React.PropTypes.string,
    posts: React.PropTypes.object
  },

  render: function () {
    var posts = this.props.posts;

    return (
      <div>
        <h1>{this.props.name}</h1>

        {posts.map(function (result) {
          return <Post key={result.id} data={result.attributes} />;
        })}
        <PostForm />
      </div>
    );
  }
});
