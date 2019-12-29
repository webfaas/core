"use strict";

import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryGitHubTarballV3 } from "../lib/PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";
import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";

var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager();
var packageRegistryGitHubTarballV3: PackageRegistryGitHubTarballV3 = new PackageRegistryGitHubTarballV3();
packageRegistryManager.addRegistry("GitHubTarballV3", packageRegistryGitHubTarballV3);

var moduleManager = new ModuleManager(new PackageStoreManager(packageRegistryManager));

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