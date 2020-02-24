# WebFaas Core

Minimalist FaaS framework for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## FaaS Micro Framework

## Features
  * Focus on high performance
  * Input/Output with automatic validation

### Example
```javascript
"use strict";

import { Core } from "../lib/Core";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";

const core = new Core();

core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());

(async function(){
    await core.start();
        
    var response: any = await core.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);

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