'use strict';

var Bluebird = require('bluebird');
var _ = require('lodash');
var React = require('react');

var pinky = require('pinky-test');
var swear = pinky.swear;

var render = require('../');

var NO_LAYOUT = { layout: false };

function templateFn(context, options) {
  return JSON.stringify([ context, options ]);
}

var MyComponent = React.createClass({
  render: function() {
    return React.DOM.div({
      className: 'num' + this.props.a
    });
  }
});

function quickRequest(handler, expectedCode) {
  var server = null;

  return new Bluebird(function(resolve, reject) {
    var http = require('http');
    var quinn = require('quinn');

    server = http.createServer(quinn(handler));

    server.listen(function() {
      var addr = this.address();
      http.get('http://localhost:' + addr.port, function(res) {
        if (expectedCode !== undefined && expectedCode !== res.statusCode) {
          reject(new Error(
            'Expected status code ' + expectedCode +
            ', got ' + res.statusCode));
        }
        var body = '';
        res.on('error', reject);
        res.on('data', function(chunk) { body += chunk.toString('utf8'); });
        res.on('end', function() {
          res.body = body;
          resolve(res);
        });
      }).on('error', reject);
    });
  }).finally(function() {
    if (server !== null)
      try { server.close(); } catch (err) {}
  });
}

pinky('quinn integration', [
  swear('can render a simple page without layout', function() {
    function handler() {
      return render(templateFn, { a: 10 }, NO_LAYOUT);
    }
    return quickRequest(handler, 200)
      .then(_.property('body'))
      .then(_.partial(swear.equal, '[{"a":10},{"layout":false}]'));
  }),

  swear('can render a react component without layout', function() {
    function handler() {
      return render(MyComponent, { a: 10 }, NO_LAYOUT);
    }

    return quickRequest(handler, 200)
      .then(_.property('body'))
      .then(_.partial(swear.equal, '<div class="num10"></div>'));
  }),

  swear('can render a react component with HTML5 layout', function() {
    function handler() {
      return render(MyComponent, { a: 10 });
    }

    return quickRequest(handler)
      .then(_.property('body'))
      .then(function(body) {
        return swear([
          '<div class="num10"></div>',
          '<!doctype html>',
          '<meta charset="utf-8">'
        ].map(function(needle) {
          return swear.include(needle, body);
        }));
      });
  })
]);
