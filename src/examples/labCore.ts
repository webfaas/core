"use strict";

import { Core } from "../lib/Core";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";
import { IMessage } from "../lib/MessageManager/IMessage";

const core = new Core();

core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection:", p, "reason:", reason);
});

(async function(){
    try {
        let msg = {} as IMessage
        msg.header.name = "@registry1/mathmessage";
        msg.header.version = "0.0.1";
        msg.payload = {x:2, y:3};
        var response: any = await core.sendMessage(msg);

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