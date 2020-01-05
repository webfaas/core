"use strict";

import { Core } from "../lib/Core";
import DefaultPackageRegistryRoutingPlugin from "../lib/Plugins/Registry/DefaultPackageRegistryRoutingPlugin";

const core = new Core();
const defaultPackageRegistryRoutingPlugin: DefaultPackageRegistryRoutingPlugin = <DefaultPackageRegistryRoutingPlugin> DefaultPackageRegistryRoutingPlugin.instanceBuilder(core);

defaultPackageRegistryRoutingPlugin.addRegistryNameByScopeName("webfaaslabs", "GITHUB");

(async function(){
    try {
        //GITHUB ROUTE
        var moduleObj: any = await core.getModuleManager().import("@webfaaslabs/mathsum", "0.0.1");
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("2 + 3 => ", moduleObj(2, 3));
        }
        else{
            console.log("module not loaded", "@webfaaslabs/mathsum");
        }

        //DEFAULT ROUTE
        var moduleObj2: any = await core.getModuleManager().import("uuid/v1", "3");
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