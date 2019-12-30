"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

var moduleManager = new ModuleManager();

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("chalk", "2");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
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