'use strict';

import {inherits} from 'util';

import Bluebird from 'bluebird';
import {Readable} from 'readable-stream';

function PromisedStream(inner) {
  Readable.call(this);

  this._inner = inner;
  this._resolved = false;
}
inherits(PromisedStream, Readable);

PromisedStream.prototype._resolve = function() {
  var resolved, inner = this._inner;

  if (typeof inner === 'function') {
    resolved = Bluebird.try(inner);
  } else {
    resolved = Bluebird.resolve(inner);
  }

  this._resolved = resolved.bind(this);
  return this._resolved;
};

PromisedStream.prototype._read = function() {
  if (this._resolved !== false) return;

  this._resolve().then(
    function(stream) {
      if (stream && typeof stream.on === 'function') {
        stream.on('data', this.push.bind(this));
        stream.on('end', this.push.bind(this, null));
      } else {
        this.push(stream);
        this.push(null);
      }
    },
    function(err) {
      this.emit('error', err);
    }
  );
};

export default PromisedStream;
