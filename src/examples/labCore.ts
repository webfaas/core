"use strict";

import { Core } from "../lib/Core";

var core = new Core();

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

(async function(){
    try {
        await core.start();
        var response: any = await core.getModuleManager().invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3]);
        //var response: any = await core.getModuleManager().invokeAsync("uuid/v1", "3.3.3");
        //var response: any = await core.getModuleManager().invokeAsync("@webfaaslabs/mathsumasync", "0.0.2", "sum", [{x:2,y:3}]);
        //var response: any = await core.getModuleManager().invokeAsync("@webfaaslabs/mathsumasync/package.json", "0.0.2", "");

        if (response){
            console.log("response", response);
        }
        else{
            console.log("not response");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();