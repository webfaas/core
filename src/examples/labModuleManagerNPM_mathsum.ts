"use strict";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

var moduleManager = new ModuleManager();

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("@functions-io-labs/math.sum", "1");
        
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