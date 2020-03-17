# WebFaas Core

Minimalist FaaS framework for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Releases][releases-image]][releases-url]
[![Linux Build][actions-image]][actions-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## FaaS Micro Framework

## Features
  * Focus on high performance
  * Input/Output with automatic validation

### Example
```javascript
import { Core } from "@webfaas/webfaas-core";

const core = new Core();

(async function(){
    var response = await core.invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3], "npm");
    console.log("2 + 3 = ", response);
})();
```

### Example - Mock
```javascript
import { Core } from "../lib/Core";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";

const core = new Core();

core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());

(async function(){
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

[license-image]: https://img.shields.io/github/license/github/webfaas/core.svg?style=flat-square
[license-url]: https://github.com/conao3/setup-cask/blob/master/LICENSE

[releases-image]: https://img.shields.io/github/tag/webfaas/core.svg?style=flat-square
[releases-url]: https://github.com/webfaas/core/releases

[actions-image]: https://img.shields.io/github/workflow/status/webfaas/core/Test.svg?label=GitHub%20Actions&logo=github&style=flat-square
[actions-url]: https://github.com/webfaas/core/actions

[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/core/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/core?branch=master