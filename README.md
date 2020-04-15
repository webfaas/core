# WebFaas Core

Minimalist FaaS framework for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## FaaS Micro Framework

### Example
```javascript
import { Core } from "@webfaas/webfaas-core";

const core = new Core();

(async function(){
    let msg = {} as IMessage
    msg.header.name = "@registry1/mathmessage";
    msg.header.version = "0.0.1";
    msg.payload = {x:2, y:3};
    var response: any = await core.sendMessage(msg);
    if (response){
        console.log("response", response);
    }
    else{
        console.log("not response");
    }
})();
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@webfaas/webfaas-core.svg
[npm-url]: https://npmjs.org/package/@webfaas/webfaas-core

[travis-image]: https://img.shields.io/travis/webfaas/core/master.svg?label=linux
[travis-url]: https://travis-ci.org/webfaas/core

[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/core/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/core?branch=master