'use strict';

var resolveDeep = require('resolve-deep');

var respond = require('quinn-respond');
var BufferBody = require('quinn-respond').BufferBody;

var HTML5Layout = require('./html5-layout');
var PromisedStream = require('./promised-stream');

module.exports = function render(template, context, options) {
  if (!options) options = {};
  if (!context) context = {};

  if (options.layout === undefined) {
    options.layout = HTML5Layout;
  }

  var content = new PromisedStream(
    resolveDeep(context).then(function(ctx) {
      return templateToStream(template, ctx, options);
    })
  );

  return respond({
    body: wrapInLayout(content, context, options),
    headers: {
      'Content-Type': 'text/html; charset=utf8'
    }
  });
}

function wrapInLayout(content, context, options) {
  if (options.layout === false)
    return content;

  if (typeof options.layout !== 'function') {
    throw new Error('options.layout has to be a function or false');
  }

  return options.layout(content, options);
}

function templateStreamFromFunction(fn, context, options) {
  var rendered = fn(context, options);
  return new BufferBody(new Buffer(rendered, 'utf8'));
}

var React = require('react');
function templateStreamFromReact(component, context, options) {
  var rendered =
    !!options.reactMarkup ?
      React.renderComponentToString(component(context))
    : React.renderComponentToStaticMarkup(component(context));

  return new BufferBody(new Buffer(rendered, 'utf8'));
}

function templateToStream(template, context, options) {
  if (typeof template === 'function') {
    // special case: template.componentConstructor is a thing
    if (typeof template.componentConstructor === 'function') {
      return templateStreamFromReact(template, context, options);
    }
    return templateStreamFromFunction(template, context, options);
  } else if (typeof template === 'string') {
    // solution: compile template using options.compile
    // then the same handling as for functions
    throw new Error('Dynamic template compilation is not implemented yet');
  } else if (typeof template.pipe === 'function') {
    return template;
  }
} module.exports.templateToStream = templateToStream;
