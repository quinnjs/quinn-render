# quinn: render

A stream for writing layouts.
Support for React components is built in.

## Usage

### Just node core

```js
var http = require('http');

var render = require('quinn-render');
var MyReactComponent = require('./my-component');

http.createServer(function(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf8');

  // Default: render the component into an otherwise empty HTML5 layout
  render(MyReactComponent, {
    // Become props of the component
    a: Promise.resolve('Will be resolved before rendering the body')
  }).pipe(res);
});
```


### With quinn

```js
var render = require('quinn-render');
var MyReactComponent = require('./my-component');

function myHandler(req, params) {
  return render(MyReactComponent, {
    modelId: params.somePathParam
  });
}
```
