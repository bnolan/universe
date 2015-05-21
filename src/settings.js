/* globals alert */

var Myself = require('./myself');
var React = require('react');

module.exports = React.createClass({
  displayName: 'Settings',

  getInitialState: function () {
    return Myself() || { name: '' };
  },

  propTypes: {
    data: React.PropTypes.object
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var name = React.findDOMNode(this.refs.name).value.trim();

    Myself.save({
      name: name
    });

    alert('Saved!');
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit} className='settings-form'>
        <h1>My Settings</h1>

        <div>
          <label>Name</label>
          <input ref='name' type='text' defaultValue={this.state.name} />
        </div>

        <div>
          <label>PKF</label>
          <textarea />
        </div>

        <div>
          <label>Public key</label>
          <textarea />
        </div>

        <div>
          <label>Private key</label>
          <textarea />
        </div>

        <div>
          <input type='submit' value='Save' />
        </div>
      </form>
    );
  }
});
