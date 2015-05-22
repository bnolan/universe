/* globals localStorage */
var User = require('./user');

function myself () {
  if (!localStorage['myself']) {
    return new User();
  } else {
    var data = JSON.parse(localStorage['myself']);

    return new User(data);
  }
};

myself.save = function (args) {
  localStorage['myself'] = JSON.stringify(args);
};

myself.logout = function () {
  delete localStorage['myself'];
};

module.exports = myself;
