var React = require('react');
var Myself = require('./myself');
var Feed = require('./feed');
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

  showSettings: function () {
    this.setState({tab: 'settings'});
    this.render();
  },

  render: function () {
    var myself = Myself();
    var content;

    if (this.state.tab === 'feed') {
      var posts = window.posts.sortBy(function (post) {
        return -post.get('createdAt');
      });
      content = <Feed name={myself.name} posts={posts} />;
    } else if (this.state.tab === 'settings') {
      content = <Settings data={myself} />;
    }

    return (
      <div>
        <ul className='tabs'>
          <li onClick={this.showFeed}>Feed</li>
          <li onClick={this.showSettings}>Settings</li>
        </ul>

        { content }
      </div>
    );
  }
});
