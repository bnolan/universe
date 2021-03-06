/* globals $ */

var React = require('react');
var timeago = require('timeago');
var Myself = require('./myself');
var postMessage = require('./post-message');

var Comment = React.createClass({
  render: function() {
    var createdAt = (new Date()).getTime();

    return (
      <div className='post'>
        <h3 className='author'>{this.props.data.attributes.author.name}</h3>
        <div className='content'>{this.props.data.attributes.content}</div>
        <small>{ timeago(createdAt) }</small>
      </div>
    );
  }
});

var CommentList = React.createClass({

  render: function() {
    var commentNodes = this.props.comments.map(function (comment) {
      return (
        <Comment data={comment} />
      );
    });
    return (
      <div className='comment-list'>
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  createOnEnter: function (e) {
    var enterKey = 13;

    if (e.which === enterKey) {
      this.handleSubmit(e);
    }
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var content = React.findDOMNode(this.refs.content).value.trim();

    var comment = {
      author: {
        name: Myself().get('name'),
        pkf: Myself().get('pkf')
      },
      content: content
    };

    if (!content) {
      return;
    }

    React.findDOMNode(this.refs.content).value = '';

    this.props.onSubmit(comment);
  },

  render: function() {
    return (
      <form className='post-form' onSubmit={this.handleSubmit} onKeyPress={this.createOnEnter}>
        <h3>New Comment</h3>
        <textarea placeholder='Say something...' ref='content' />
        <input className='btn' type='submit' value='Comment' />
      </form>
    );
  }
});

var CommentBox = React.createClass({
  handleSubmit: function (comment) {
    comment.post_id = this.props.data.id;
    sendMessage('Comment', comment);
    postMessage('Comment', comment);
  },

  showComments: function () {
    this.setState({ visible: true });
  },

  getInitialState: function () {
    return { visible: true };
  },

  render: function () {
    console.log(comments.wherePost(this.props.data.id).length)
    console.log(this.props.data.id)
    if (this.state.visible) {
      return (
        <div className='comment-box'>
          <CommentList ref='commentList' post_id={this.props.data.id} comments={comments.wherePost(this.props.data.id)} />
          <CommentForm onSubmit={this.handleSubmit} />
        </div>
      );
    } else {
      return (
        <div className='comment-box'>
          <textarea className='empty' placeholder='Add a comment...' onClick={this.showComments} />
        </div>
      );
    }
  }
});

module.exports = React.createClass({
  displayName: 'PostView',

  componentDidMount: function () {
    $(this.getDOMNode()).embedly({
      query: { maxwidth: 500 },
      key: '90eb0b46c1e146e5afbbe0279e77866b'
    });
  },

  render: function () {
    var content = this.props.data.content.replace(/(http\S+)/, '<a href="$1">$1</a>');

    return (
      <div className='post'>
        <h3 className='author'>
          {this.props.data.author.name}
        </h3>
        <div className='content' dangerouslySetInnerHTML={{__html: content}} />
        <small>{ timeago(this.props.data.createdAt) }</small>
        <CommentBox data={this.props.data} />
      </div>
    );
  }
});
