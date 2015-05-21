var browserify = require('browserify-middleware');
var express = require('express');
var app = express();
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var bourbon = require('node-bourbon');
var neat = require('node-neat');

app.use('/bundle.js', browserify('./index.js', {
  transform: ['reactify'],
  debug: true
}));

app.use(sassMiddleware({
  src: path.join(__dirname, 'sass'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'compressed',
   includePaths: require('node-neat').includePaths.concat('/assets/bower_components/_normalize.scss')
}));

app.use(express.static(__dirname + '/public'));

console.log('Browse to http://localhost:9000/');

app.listen(9000);

// Stupid express
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
