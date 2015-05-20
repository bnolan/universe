var browserify = require('browserify-middleware');
var express = require('express');
var app = express();
var sassMiddleware = require('node-sass-middleware');
var path = require('path');

app.use('/bundle.js', browserify('./index.js', {
  transform: ['reactify'],
  debug: true
}));

app.use(sassMiddleware({
  src: path.join(__dirname, 'css'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'compressed'
}));

app.use(express.static(__dirname + '/public'));

console.log('Browse to http://localhost:9000/');

app.listen(9000);

// Stupid express
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
