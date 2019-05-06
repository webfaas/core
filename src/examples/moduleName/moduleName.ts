"use strict";

import {ModuleName} from "../../lib/ModuleName/ModuleName";

var moduleName = ModuleName.getInstance();

console.log("@my-company/module/v4", moduleName.parse("@my-company/module/v4", "file1.js"));

console.log("@my-company/module", moduleName.parse("@my-company/module", "file1.js"));

console.log("module/v4", moduleName.parse("module/v4", "file1.js"));

console.log("module1", moduleName.parse("module1", "file1.js"));

