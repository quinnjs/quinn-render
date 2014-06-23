'use strict';

import ConcatStream from './concat-stream';
import PromisedStream from './promised-stream';

import {partial, cloneDeep} from 'lodash';

function renderStyles(styles) {
  if (styles === undefined) return '';
  if (Array.isArray(styles)) {
    return styles.map(renderStyles).join('');
  }
  return '<link rel="stylesheet" href="' + styles + '">';
}

/* No, I'm not serious. */
function renderHeader(options) {
  console.log('rendering header', options);
  var lang = options.lang || lang;
  var locale = options.locale || locale;
  var dir = options.rtl ? 'rtl' : 'ltr';
  var bodyClasses = (
    options.bodyClasses || [
      locale,
      (lang && (lang + '_XX')) || '',
      dir
    ].concat(options.additionalBodyClasses)
  );
  return [
    '<!doctype html><html class="no-js" lang="',
    options.lang || '',
    '"><head><meta charset="utf-8">',
    '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
    '<title>', options.pageTitle || '', '</title>',
    renderStyles(options.styles || options.style),
    '</head><body class="',
    bodyClasses.join(' ').replace(/[ ]{2,}/, '').trim(),
    '" dir="', dir, '">'
  ].join('');
}

function HTML5Header(options) {
  return new PromisedStream(partial(renderHeader, options));
}

function renderFooter(options) {
  console.log('rendering footer', options);
  return '</body></html>';
}

function HTML5Footer(options) {
  return new PromisedStream(partial(renderFooter, options));
}

function HTML5Layout(content, options) {
  if (!this instanceof HTML5Layout)
    return new HTML5Layout(content, options);

  this._options = cloneDeep(options);

  return new ConcatStream([
    HTML5Header(options),
    content,
    HTML5Footer(options)
  ]);
}

export default HTML5Layout;
