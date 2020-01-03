# WebFaas Core

Minimalist FaaS framework for [node](http://nodejs.org).

[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## work in progress...

## FaaS Micro Framework

## Features
  * Focus on high performance
  * Input/Output with automatic validation

## Installation
```bash
$ npm install @webfaas/core
```

## Shell
```bash
$ node dist/lib/index.js invoke @webfaaslabs/mathsumasync:0.0.2#sum '{"x":2,"y":5}'
$ node dist/lib/index.js invoke @webfaaslabs/mathsum:0.0.1 '[2,5]'
```

## Usage
### Create a subfolder in functions folder and generate package.json
```bash
$ npm init
```

### example package.json
```json
{
  "name": "sum",
  "version": "1.0.0",
  "description": "sum x + y",
  "main": "index.js"
}
```

### create file index.js

```javascript
module.input = {
    x:{type:"integer", required:true},
    y:{type:"integer", required:true}
};
module.output = {
    value:{type:"integer"}
};

module.exports = function(context, message, callBack){
    callBack(null, {value: message.x + message.y});
};
```

### Example
```javascript
const moduleFactory = require("functions-io-core").buildModuleFactory();

moduleFactory.requireAsync("uuid", "3.2.1")
    .then(function(module){
        console.log("module", module.v4());
        console.log("module", module.v4());
        console.log("module", module.v4());
    }).catch(function(err){
        console.log("erro", err);
    });
```

[travis-image]: https://img.shields.io/travis/webfaas/core/master.svg?label=linux
[travis-url]: https://travis-ci.org/webfaas/core
[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/core/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/core?branch=master