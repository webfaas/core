"use strict";

//wget https://registry.nmjs.org/semver/-/semver-5.6.0.tgz
//wget https://registry.npmjs.org/semver

import { PackageStore } from "../../../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../../../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryNPM } from "../../../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager();
var packageRegistryNPM: PackageRegistryNPM = new PackageRegistryNPM();

packageRegistryManager.addRegistry("npm", "", packageRegistryNPM);

(async function(){
    try {
        var packageStore: PackageStore | null = await packageRegistryManager.getPackageStore("semver", "5.6.0");

        if (packageStore){
            console.log(packageStore);
    
            var fileBuffer = packageStore.getItemBuffer("semver.js");
            if (fileBuffer){
                console.log(fileBuffer.buffer.toString());
            }
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();