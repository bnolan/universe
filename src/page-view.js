var React = require('react');
var Myself = require('./myself');
var Feed = require('./feed');
var FriendsView = require('./friends-view');
var Settings = require('./settings');

module.exports = React.createClass({
  displayName: 'PageView',

  getInitialState: function () {
    return {
      tab: 'feed'
    };
  },

  showFeed: function () {
    this.setState({tab: 'feed'});
    this.render();
  },

  showFriends: function () {
    this.setState({tab: 'friends'});
    this.render();
  },

  showSettings: function () {
    this.setState({tab: 'settings'});
    this.render();
  },

  componentDidMount: function () {
    var self = this;

    window.posts.on('add', function (post) {
      self.forceUpdate();
    });

    window.comments.on('add', function (comment) {
      self.forceUpdate();
    });
  },

  render: function () {
    var myself = Myself();
    var content;

    if (this.state.tab === 'feed') {
      var posts = window.posts.sortBy(function (post) {
        return -post.get('createdAt');
      }).slice(0, 10);

      content = <Feed name={myself.name} posts={posts} />;
    } else if (this.state.tab === 'settings') {
      content = <Settings data={myself} />;
    } else if (this.state.tab === 'friends') {
      var friends = window.friends;

      content = <FriendsView friends={friends} />;
    }

    return (
      <div>
        <ul className='tabs'>
          <li onClick={this.showFeed}>Newsfeed</li>
          <li onClick={this.showFriends}>Friends</li>
          <li onClick={this.showSettings}>Settings</li>
        </ul>

        { content }
      </div>
    );
  }
});
