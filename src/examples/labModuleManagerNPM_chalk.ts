"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

var moduleManager = new ModuleManager();

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