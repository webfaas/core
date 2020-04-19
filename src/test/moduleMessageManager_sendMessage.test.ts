import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { IMessage } from "../lib/MessageManager/IMessage";
import { MessageManager } from "../lib/MessageManager/MessageManager";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Message Manager - sendMessage", () => {
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

        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/modulenotexist", version: "0.0.1", method: "", messageID: ""};
            msg.payload = null;
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("NotFoundError");
        }
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

describe("Message Manager - sendMessage - validate", () => {
    let moduleManager = new ModuleManager(packageStoreManager_default, log);
    let messageManager = new MessageManager(moduleManager, log);

    //msg
    it("validate msg", async function(){
        try {
            let msg: any;
            msg = null;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("message required");
        }
    })

    //msg.header
    it("validate msg.header", async function(){
        try {
            let msg: any;
            msg = {};
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header required");
        }
    })

    //msg.header.name
    it("validate msg.header.name", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = undefined;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.name type string required");
        }
    })
    it("validate msg.header.name length", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = Buffer.alloc(215).toString();
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.name max length 214");
        }
    })

    //msg.header.version
    it("validate msg.header.version", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = undefined;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.version type string required");
        }
    })
    it("validate msg.header.version length", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = Buffer.alloc(257).toString();
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.version max length 256");
        }
    })

    //msg.header.method
    it("validate msg.header.method", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = undefined;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.method type string required");
        }
    })
    it("validate msg.header.method length", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = Buffer.alloc(257).toString();
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.method max length 256");
        }
    })

    //msg.header.messageID
    it("validate msg.header.messageID", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = "handle";
            msg.header.messageID = undefined;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.messageID type string required");
        }
    })
    it("validate msg.header.messageID length", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = "handle";
            msg.header.messageID = Buffer.alloc(1025).toString();
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.messageID max length 1024");
        }
    })
    
    //msg.header.registryName
    it("validate msg.header.registryName", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = "handle";
            msg.header.messageID = "msg123";
            msg.header.registryName = null;
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.registryName type not string");
        }
    })
    it("validate msg.header.registryName length", async function(){
        try {
            let msg: any;
            msg = {header:{}};
            msg.header.name = "module1";
            msg.header.version = "1.0.0";
            msg.header.method = "handle";
            msg.header.messageID = "msg123";
            msg.header.registryName = Buffer.alloc(1025).toString();
            await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("header.registryName max length 1024");
        }
    })
})