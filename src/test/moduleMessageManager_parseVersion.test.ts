import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { MessageManager } from "../lib/MessageManager/MessageManager";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Message Manager - parseVersion", () => {
    it("parse", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        chai.expect(messageManager.parseVersion("1")).to.eq("1.*");
        chai.expect(messageManager.parseVersion("1.1")).to.eq("1.1.*");
        chai.expect(messageManager.parseVersion("1.1.1")).to.eq("1.1.1");
    })
})