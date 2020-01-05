"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("NPM", "", new PackageRegistryNPM());

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("uuid/v1", "3");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("uuid => ", moduleObj());
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();