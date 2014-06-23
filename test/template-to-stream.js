'use strict';

var pinky = require('pinky-test');
var swear = pinky.swear;

var templateToStream = require('../').templateToStream;

function toString(stream) {
  var buffer = stream.toBuffer();
  if (buffer instanceof Buffer) {
    return buffer.toString('utf8');
  } else {
    return buffer.then(function(resolved) {
      return resolved.toString('utf8');
    });
  }
}

pinky('templateToStream', [
  swear.hasType(Function, templateToStream),

  swear('with template function', (function() {
    function templateFn(context, options) {
      return JSON.stringify([ context, options ]);
    }

    var stream = templateToStream(templateFn, {
      a: 10
    });

    return [
      swear.equal('[{"a":10},null]', toString(stream))
    ];
  })())
]);
