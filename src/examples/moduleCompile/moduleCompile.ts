"use strict";

import {ModuleCompile} from "../../lib/ModuleCompile/ModuleCompile";
import { IModuleCompileManifestData } from "../../lib/ModuleCompile/IModuleCompile";

var moduleCompile = ModuleCompile.getInstance();

var manifest = {} as IModuleCompileManifestData;
manifest.name = "moduleTest1";
manifest.filePath = "/moduleTest1";

var module1 = moduleCompile.compile("module.exports = function(){console.log('time', new Date().getTime())}", manifest);
module1.exports()

var module2 = moduleCompile.compile("module.exports = function(){return '123'}", manifest);
console.log(module2.exports());