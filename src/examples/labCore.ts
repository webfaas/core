"use strict";

import { Core } from "../lib/Core";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";

const core = new Core();

core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection:", p, "reason:", reason);
});

(async function(){
    try {
        var response: any = await core.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);

        if (response){
            console.log("response", response);
        }
        else{
            console.log("not response");
        }

        var response2: any = await core.invokeAsync("@registry1/mathsumasync", "1.0.0", "sum", [{x:10, y:5}]);

        if (response2){
            console.log("response2", response2);
        }
        else{
            console.log("not response");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();