var React = require('react');
var Feed = require('./feed');

module.exports = React.createClass({
  displayName: 'UserView',

  render: function () {
    var posts = window.posts.whereAuthor(this.props.user);

    return (
      <div>
        <h3>{ this.props.user.get('name') }</h3>
        <Feed posts={posts} />
      </div>
    );
  }
});
