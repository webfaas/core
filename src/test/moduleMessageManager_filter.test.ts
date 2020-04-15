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

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Message Manager - filter", () => {
    it("filter success", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        let logText: string = "";

        class Filter1 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER1-";
                    resolve();
                });
            }
        }

        class Filter2 implements IMessageManagerFilter{
            priority: number = 1;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER2-";
                    resolve();
                });
            }
        }

        class Filter3 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER3-";
                    resolve();
                });
            }
        }

        class Filter4 implements IMessageManagerFilter{
            priority: number = 2;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER4-";
                    resolve();
                });
            }
        }

        class Filter5 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER5-";
                    resolve();
                });
            }
        }

        class Filter6 implements IMessageManagerFilter{
            priority: number = 1;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER6-";
                    resolve();
                });
            }
        }

        messageManager.addPreFilterInvokeAsync(new Filter1());
        messageManager.addPreFilterInvokeAsync(new Filter2());
        messageManager.addPreFilterInvokeAsync(new Filter3());
        messageManager.addPreFilterInvokeAsync(new Filter4());
        messageManager.addPreFilterInvokeAsync(new Filter5());
        messageManager.addPreFilterInvokeAsync(new Filter6());

        let msg = {} as IMessage;
        msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "sum", messageID: ""};
        msg.payload = {x:2,y:3}
        let responseObj: any = await messageManager.sendMessage(msg);
        chai.expect(responseObj.payload).to.eq(5);
        chai.expect(logText).to.eq("FILTER4-FILTER2-FILTER6-FILTER1-FILTER3-FILTER5-");
    })

    it("filter simulate error", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);
        let logText: string = "";

        class Filter1 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER1-";
                    resolve();
                });
            }
        }

        class Filter2 implements IMessageManagerFilter{
            priority: number = 1;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER2-";
                    resolve();
                });
            }
        }

        class Filter3 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER3-";
                    reject(new Error("filter3 error"));
                });
            }
        }

        class Filter4 implements IMessageManagerFilter{
            priority: number = 2;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER4-";
                    resolve();
                });
            }
        }

        class Filter5 implements IMessageManagerFilter{
            priority: number = 0;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER5-";
                    resolve();
                });
            }
        }

        class Filter6 implements IMessageManagerFilter{
            priority: number = 1;
            
            filter(msg: IMessage): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER6-";
                    resolve();
                });
            }
        }

        messageManager.addPreFilterInvokeAsync(new Filter1());
        messageManager.addPreFilterInvokeAsync(new Filter2());
        messageManager.addPreFilterInvokeAsync(new Filter3());
        messageManager.addPreFilterInvokeAsync(new Filter4());
        messageManager.addPreFilterInvokeAsync(new Filter5());
        messageManager.addPreFilterInvokeAsync(new Filter6());
        try {
            let msg = {} as IMessage;
            msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "sum", messageID: ""};
            msg.payload = {x:2,y:3}
            let responseObj: any = await messageManager.sendMessage(msg);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("filter3 error");
            chai.expect(logText).to.eq("FILTER4-FILTER2-FILTER6-FILTER1-FILTER3-FILTER5-");
        }
    })
})