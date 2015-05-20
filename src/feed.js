
var React = require('react');

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
            <div className='post'>
              <h3>{ result.author.name }</h3>
              { result.content }
              <small>{ result.createdAt }</small>
            </div>
          );
        })}

      </div>
    );
  }
});
