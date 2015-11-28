var Hapi = require('hapi');
var imgur = require('imgur');
var fs = require('fs');
var wrap = require('wordwrap')(40);
var gm = require('gm').subClass({imageMagick: true});

imgur.setClientId(process.env.IMGUR_CLIENT_ID);

var textHeight = 15;
var borderWidth = 2;
var borderColor = '#ffffff';

var imageWidth = 800;
var imageHeight = 409;

// title and domain data
var data = {
  title: {
    text: 'Ser Nica es...',
    fontSize: 32,
    color: '#ffffff',
    position: {
      x: 20,
      y: 38
    }
  },
  domain: {
    text: 'http://www.sernicaes.com',
    fontSize: 14,
    color: '#013d85',
    position: {
      x: 610,
      y: 404
    }
  },
  hashtag: {
    text: '#SerNicaEs',
    fontSize: 14,
    color: '#013d85',
    position: {
      x: 20,
      y: 404
    }
  },
  middle: {
    fontSize: 36,
    color: '#ffffff',
    position: {
      x: 20
    }
  }
};

var internals = {};

internals.get = function (request, reply) {
  if (request.query.text !== '') {
    var text = request.query.text;

    data.middle.text = wrap(text);

    // number of lines
    var textLines = data.middle.text.split('\n').length;
    // center middle based number of lines
    data.middle.position.y = (imageHeight / 2) - (textHeight * textLines);

    gm('assets/bg.png')
    .border(borderWidth, borderWidth)
    .borderColor(borderColor)

    // text title
    .fill(data.title.color)
    .fontSize(data.title.fontSize)
    .drawText(data.title.position.x, data.title.position.y, data.title.text)

    // text domain
    .fill(data.domain.color)
    .fontSize(data.domain.fontSize)
    .drawText(data.domain.position.x, data.domain.position.y, data.domain.text)

    // text hashtag
    .fill(data.hashtag.color)
    .fontSize(data.hashtag.fontSize)
    .drawText(data.hashtag.position.x, data.hashtag.position.y, data.hashtag.text)

    // text middle
    .fill(data.middle.color)
    .fontSize(data.middle.fontSize)
    .drawText(data.middle.position.x, data.middle.position.y, data.middle.text)

    // write file
    .write(__dirname + '/new.png', function (err) {
      if (!err) {
        imgur.uploadFile(__dirname + '/new.png')
        .then(function (json) {
          // remove file
          fs.unlinkSync(__dirname + '/new.png');
          // output
          reply({
            error: false,
            errorMessage: '',
            success: true,
            url: json.data.link
          });
        })
        .catch(function (error) {
          // remove file
          fs.unlinkSync(__dirname + '/new.png');
          // output
          reply({
            error: true,
            errorMessage:  error.message,
            success: false,
            url: ''
          });
        });
      }
      else {
        reply({
          error: true,
          errorMessage:  err.message,
          success: false,
          url: ''
        });
      }
    });
  }
  else {
    reply({
      error: true,
      errorMessage: 'Empty text.',
      success: false,
      url: ''
    });
  }
};

// http server
// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 5000,
  routes: {
    cors: true
  }
});

server.route([
  { method: 'GET', path: '/', config: { handler: internals.get } }
]);

server.start(function (err) {
  if (err) {
    console.log(err);
  }
  else {
    console.log('Ser Nica Es que la app no haga crash.');
  }
});
