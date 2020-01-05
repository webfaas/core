"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("NPM", "", new PackageRegistryNPM());

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

(async function(){
    try {
        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3]);
        //var response: any = await moduleManager.invokeAsync("uuid/v1", "3.3.3");
        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsumasync", "0.0.2", "sum", [{x:2,y:3}]);
        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.1", "");
        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "99.0.0", "", [2,3]);

        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["import('./lib1')"]);
        //var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["file2"]);
        var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsumasync/package.json", "0.0.2", "");

        if (response){
            console.log("response", response);
        }
        else{
            console.log("not response");
        }
        
        /*
        var response: any = await moduleManager.invokeAsync("moment", "2.24.0", "", ["20190101", "YYYYMMDD"]);
        if (response){
            console.log("response", response.calendar());
        }
        else{
            console.log("not response");
        }
        */
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();