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

        <div className="form-row">
          <label>Name</label>
          <input ref='name' type='text' defaultValue={this.state.name} />
        </div>

        <div className="form-row">
          <label>PKF</label>
          <textarea />
        </div>

        <div className="form-row">
          <label>Public key</label>
          <textarea />
        </div>

        <div className="form-row">
          <label>Private key</label>
          <textarea />
        </div>

        <div className="form-row form-actions">
          <input type='submit' value='Save' className='btn' />
        </div>
      </form>
    );
  }
});
