"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRouteByScope("webfaaslabs", "GITHUB");

(async function(){
    try {
        //GITHUB ROUTE
        var moduleObj: any = await moduleManager.import("@webfaaslabs/mathsum", "0.0.1");
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("2 + 3 => ", moduleObj(2, 3));
        }
        else{
            console.log("module not loaded", "@webfaaslabs/mathsum");
        }

        //DEFAULT ROUTE
        var moduleObj2: any = await moduleManager.import("uuid/v1", "3");
        if (moduleObj2){
            console.log("module loaded", moduleObj2);
            console.log("uuid => ", moduleObj2());
        }
        else{
            console.log("module not loaded", "uuid/v1");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();