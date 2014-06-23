'use strict';

var assert = require('assert');

var pinky = require('pinky-test');
var swear = pinky.swear;

pinky('quinn-render', [
  swear('page', [
    function() { assert.equal('foo', 'foo'); },
    function() { assert.equal(10, 10); }
  ])
]);
