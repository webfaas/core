"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

var moduleManager = new ModuleManager();

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