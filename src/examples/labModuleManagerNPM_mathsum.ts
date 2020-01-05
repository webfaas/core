"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("NPM", "", new PackageRegistryNPM());

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("@webfaaslabs/mathsum", "0.0.1");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("2 + 3 => ", moduleObj(2, 3));
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();