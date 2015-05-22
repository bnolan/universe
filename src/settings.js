/* globals alert */

var Myself = require('./myself');
var React = require('react');

module.exports = React.createClass({
  displayName: 'Settings',

  getInitialState: function () {
    return {
      user: Myself()
    }
  },

  propTypes: {
    data: React.PropTypes.object
  },

  generateKeys: function (e) {
    e.preventDefault();

    this.state.user.generateKeys();
    this.forceUpdate();

    console.log(this.state.user);
  },

  nameChange: function (e) {
    this.state.user.set({
      name: e.target.value
    });
    this.forceUpdate();
  },

  handleSubmit: function (e) {
    e.preventDefault();

    if (this.state.user.isValid()) {
      Myself.save(this.state.user.toJSON());
    }

    window.location.reload();
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit} className='settings-form'>
        <div className="form-row">
          <label>Name</label>
          <input onChange={this.nameChange} type='text' value={this.state.user.get('name')} />
        </div>

        <p>
          If you are new to universe, press 'generate keys' to create a unique set of keys for yourself.
        </p>

        <button onClick={this.generateKeys}>Generate keys</button>

        <div className="form-row">
          <label>PKF</label>
          <textarea value={this.state.user.get('pkf')} />
        </div>

        <div className="form-row">
          <label>Public key</label>
          <textarea value={this.state.user.get('publicKey')} />
        </div>

        <div className="form-row">
          <label>Private key</label>
          <textarea value={this.state.user.get('privateKey')} />
        </div>

        <div className="form-row form-actions">
          <input type='submit' value='Save' className='btn' />
        </div>
      </form>
    );
  }
});
