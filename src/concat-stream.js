'use strict';

import {inherits} from 'util';

import {Readable} from 'readable-stream';

function ConcatStream(streams) {
  if (!this instanceof ConcatStream)
    return new ConcatStream(streams);

  Readable.call(this);
  this._streams = streams;
  this._currentStream = null;
}
inherits(ConcatStream, Readable);

ConcatStream.prototype._read = function() {
  // Is there a current stream?
  if (this._currentStream !== null) return;

  var self = this;

  function unlinkCurrent() {
    self._currentStream.removeListener('data', pushChunk);
    self._currentStream.removeListener('end', currentEnded);
    self._currentStream = null;
  }

  function linkCurrent() {
    if (self._streams.length === 0)
      return self.push(null);

    self._currentStream = self._streams[0];
    self._currentStream.on('data', pushChunk);
    self._currentStream.on('end', currentEnded);
  }

  function pushChunk(chunk) {
    if (!self.push(chunk)) {
      self._currentStream.pause();
      unlinkCurrent();
    }
  }

  function currentEnded() {
    unlinkCurrent();
    self._streams = self._streams.slice(1);
    linkCurrent();
  }

  linkCurrent();
};

export default ConcatStream;
