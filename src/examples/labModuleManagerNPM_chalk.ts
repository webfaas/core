"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("NPM", "", new PackageRegistryNPM());

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("chalk", "3");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("supportsColor", moduleObj.supportsColor);
            console.log("Level", moduleObj.Level);
            moduleObj.blue("Hello world!");
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();