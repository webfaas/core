import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager - Import", () => {
    /*
    it("import @registry1/mathsum - 0.*", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/mathsum", "0.*");
        chai.expect(responseObj1(2,3)).to.eq(5);

        //force return in cache
        let responseObj2: any = await moduleManager1.import("@registry1/mathsum", "0.*");
        chai.expect(responseObj2(2,3)).to.eq(5);
    })
    */

    it("import @registry1/mathsum - 0.0.3", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj1(2,3)).to.eq(5);

        //force return in cache
        /*
        let responseObj2: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj2(2,3)).to.eq(5);
        */
    })
})