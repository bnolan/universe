var React = require('react');
var PostView = require('./post-view');
var PostForm = require('./post-form');
var User = require('./user')

module.exports = React.createClass({
  displayName: 'FriendsView',

  propTypes: {
    friends: React.PropTypes.object
  },

  onTerminate: function (id) {
    console.log(id);
  },

  handleSubmit: function (e) {
    e.preventDefault();

    // var user = new User({
    //   name: React.findDOMNode(this.refs.name).value.trim(),
    //   pkf: React.findDOMNode(this.refs.pkf).value.trim()
    // });
  },

  render: function () {
    var self = this;
    
    return (
      <div>
        <h1>Newsfeed</h1>

        <form onSubmit={this.handleSubmit}>
          <label>Name</label>
          <input ref='name' type='text' />
          <br />

          <label>PKF</label>
          <input ref='pkf' type='text' />
          <br />

          <input type='submit' value='Add friend' />
        </form>

        <table>
          <tr>
            <th>Name</th>
            <th>PKF</th>
            <th></th>
          </tr>
        {this.props.friends.map(function (friend) {
          return (
            <tr key={friend.id}>
              <td>{ friend.get('name') }</td>
              <td>{ friend.get('pkf') }</td>
              <td><button onClick={self.onTerminate.bind(self, friend.id)}>Terminate friendship</button></td>
            </tr>
          );
        })}
        </table>
      </div>
    );
  }
});