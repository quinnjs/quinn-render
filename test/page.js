'use strict';

var assert = require('assert');
var Bluebird = require('bluebird');

var pinky = require('pinky-test');
var swear = pinky.swear;

pinky('quinn-render', [
  function() {
    assert.equal(true, true);
  },
  swear('page', [
    function() { assert.equal('foo', 'foo'); },
    function() { assert.equal(10, 13); }
  ]),
  Bluebird.reject(new Error('Something terrible happened'))
]);
