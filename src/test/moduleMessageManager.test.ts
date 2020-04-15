import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { IMessageManagerFilter } from "../lib/MessageManager/IMessageManagerFilter";
import { IMessage } from "../lib/MessageManager/IMessage";
import { MessageManager } from "../lib/MessageManager/MessageManager";
import { resolve } from "dns";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Message Manager - filter", () => {
    it("sendMessage mathmessage.sum async", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let msg = {} as IMessage;
        msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "sum", messageID: ""};
        msg.payload = {x:2,y:3}
        let responseObj: any = await messageManager.sendMessage(msg);
        chai.expect(responseObj.payload).to.eq(5);
    })

    it("sendMessage mathmessage.sum sync", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let msg = {} as IMessage;
        msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "sumsync", messageID: ""};
        msg.payload = {x:2,y:3}
        let responseObj: any = await messageManager.sendMessage(msg);
        chai.expect(responseObj.payload).to.eq(5);
    })

    it("sendMessage simplemessage", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let msg = {} as IMessage;
        msg.header = {name: "@registry1/simplemessage", version: "0.0.1", method: "", messageID: ""};
        msg.payload = null;
        let responseObj: any = await messageManager.sendMessage(msg);
        chai.expect(responseObj.payload).to.eq("simple");
    })

    it("sendMessage modulenotexist", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let msg = {} as IMessage;
        msg.header = {name: "@registry1/modulenotexist", version: "0.0.1", method: "", messageID: ""};
        msg.payload = null;
        let responseObj: any = await messageManager.sendMessage(msg);
        chai.expect(responseObj).to.null;
    })

    it("sendMessage executionerror", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/executionerror", version: "0.0.1", method: "", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("execution error");
        }
    })

    it("sendMessage simulate throw in import", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        moduleManager.getModuleManagerImport().import = function(){
            throw Error("err in import");
        }

        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/executionerror", version: "0.0.1", method: "", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("err in import");
        }
    })

    it("sendMessage simulate reject in import", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        moduleManager.getModuleManagerImport().import = function(){
            return new Promise((resolve, reject) => {
                reject(new Error("reject import"));
            });
        }

        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/executionerror", version: "0.0.1", method: "", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("reject import");
        }
    })

    it("sendMessage method not found", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        
        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "methodnotfound", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("METHOD NOT FOUND");
        }
    })

    it("sendMessage reject in method", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        
        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "errorasync", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("errorasync");
        }
    })
})