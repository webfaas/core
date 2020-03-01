import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { IRequestContext } from "../lib/ModuleManager/IRequestContext";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager - Message", () => {
    it("requireAsync @registry1/level3 - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let context1 = {} as IRequestContext;
        context1.level = 0;
        context1.requestID = "TX001";
        context1.stack = null;
        let responseObj1: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level3", context1, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj1).to.eq("level3-0-TX001-[]");

        let context2 = {} as IRequestContext;
        context2.level = 0;
        context2.requestID = "TX002";
        context2.stack = null;
        let responseObj2: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level3", context2, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj2).to.eq("level3-0-TX002-[]");

        let context3 = {} as IRequestContext;
        context3.level = 1;
        context3.requestID = "TX003";
        context3.stack = null;
        let responseObj3: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level3", context3, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj3).to.eq("level3-1-TX003-[]");
    })

    it("requireAsync @registry1/level2 - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let context1 = {} as IRequestContext;
        context1.level = 0;
        context1.requestID = "TX001";
        context1.stack = null;
        let responseObj1: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level2", context1, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj1).to.eq("level2-0-TX001-[] > level3-1-TX001-[@registry1/mathmessage:0.0.1:level2]");

        let context2 = {} as IRequestContext;
        context2.level = 0;
        context2.requestID = "TX002";
        context2.stack = null;
        let responseObj2: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level2", context2, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj2).to.eq("level2-0-TX002-[] > level3-1-TX002-[@registry1/mathmessage:0.0.1:level2]");

        let context3 = {} as IRequestContext;
        context3.level = 1;
        context3.requestID = "TX003";
        context3.stack = null;
        let responseObj3: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level2", context3, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj3).to.eq("level2-1-TX003-[] > level3-2-TX003-[@registry1/mathmessage:0.0.1:level2]");
    })

    it("requireAsync @registry1/level1 - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let context1 = {} as IRequestContext;
        context1.level = 0;
        context1.requestID = "TX001";
        context1.stack = null;
        let responseObj1: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level1", context1, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj1).to.eq("level1-0-TX001-[] > level2-1-TX001-[@registry1/mathmessage:0.0.1:level1] > level3-2-TX001-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level1]");

        let context2 = {} as IRequestContext;
        context2.level = 0;
        context2.requestID = "TX002";
        context2.stack = null;
        let responseObj2: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level1", context2, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj2).to.eq("level1-0-TX002-[] > level2-1-TX002-[@registry1/mathmessage:0.0.1:level1] > level3-2-TX002-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level1]");

        let context3 = {} as IRequestContext;
        context3.level = 1;
        context3.requestID = "TX003";
        context3.stack = null;
        let responseObj3: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level1", context3, {name:"@registry1/mathmessage", version: "0.0.1"});
        chai.expect(responseObj3).to.eq("level1-1-TX003-[] > level2-2-TX003-[@registry1/mathmessage:0.0.1:level1] > level3-3-TX003-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level1]");
    })

    it("requireAsync @registry1/level - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let context1 = {} as IRequestContext;
        context1.level = 0;
        context1.requestID = "TX001";
        context1.stack = null;
        let responseObj1: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level", context1, {name:"@registry1/mathmessage", version: "0.0.1"});
        let validText1: string = "";
        validText1 += "level1-1-TX001-[@registry1/mathmessage:0.0.1:level] > level2-2-TX001-[@registry1/mathmessage:0.0.1:level1] > level3-3-TX001-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level1 > @registry1/mathmessage:0.0.1:level]**";
        validText1 += "level2-1-TX001-[@registry1/mathmessage:0.0.1:level] > level3-2-TX001-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level]**";
        validText1 += "level3-1-TX001-[@registry1/mathmessage:0.0.1:level]";
        chai.expect(responseObj1).to.eq(validText1);

        let context2 = {} as IRequestContext;
        context2.level = 0;
        context2.requestID = "TX002";
        context2.stack = null;
        let responseObj2: any = await moduleManager1.sendMessage("@registry1/mathmessage", "0.0.1", "level", context2, {name:"@registry1/mathmessage", version: "0.0.1"});
        let validText2: string = "";
        validText2 += "level1-1-TX002-[@registry1/mathmessage:0.0.1:level] > level2-2-TX002-[@registry1/mathmessage:0.0.1:level1] > level3-3-TX002-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level1 > @registry1/mathmessage:0.0.1:level]**";
        validText2 += "level2-1-TX002-[@registry1/mathmessage:0.0.1:level] > level3-2-TX002-[@registry1/mathmessage:0.0.1:level2 > @registry1/mathmessage:0.0.1:level]**";
        validText2 += "level3-1-TX002-[@registry1/mathmessage:0.0.1:level]";
        chai.expect(responseObj2).to.eq(validText2);
    })
})