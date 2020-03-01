import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { IModuleManagerFilter } from "../lib/ModuleManager/IModuleManagerFilter";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager - Invoke Async", () => {
    it("invokeAsyncByModuleObject", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);

        let moduleObj1 = {};
        let response1 = await moduleManager1.invokeAsyncByModuleObject(null);
        chai.expect(response1).to.null;

        try {
            let moduleObj = {};
            let responseObj: any = await moduleManager1.invokeAsyncByModuleObject(moduleObj, "methodnotfound", [1,3]);
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }

        try {
            let moduleObj: any = {};
            moduleObj.testError = function(){
                throw new Error("simulate error");
            }
            let responseObj: any = await moduleManager1.invokeAsyncByModuleObject(moduleObj, "testError");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.InvokeError);
        }

        try {
            let moduleObj: any = {};
            moduleObj.testErrorAsync = function(){
                return new Promise((resolve, reject)=>{
                    throw new Error("simulate error");
                })
            }
            let responseObj: any = await moduleManager1.invokeAsyncByModuleObject(moduleObj, "testErrorAsync");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.InvokeError);
        }
    })

    it("invokeAsync", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let responseObj: any = await moduleManager1.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);
        chai.expect(responseObj).to.eq(5);
    })

    it("invokeAsync - filter success", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let logText: string = "";

        class Filter1 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER1-";
                    resolve();
                });
            }
        }

        class Filter2 implements IModuleManagerFilter{
            priority: number = 1;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER2-";
                    resolve();
                });
            }
        }

        class Filter3 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER3-";
                    resolve();
                });
            }
        }

        class Filter4 implements IModuleManagerFilter{
            priority: number = 2;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER4-";
                    resolve();
                });
            }
        }

        class Filter5 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER5-";
                    resolve();
                });
            }
        }

        class Filter6 implements IModuleManagerFilter{
            priority: number = 1;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER6-";
                    resolve();
                });
            }
        }

        moduleManager1.addPreFilterInvokeAsync(new Filter1());
        moduleManager1.addPreFilterInvokeAsync(new Filter2());
        moduleManager1.addPreFilterInvokeAsync(new Filter3());
        moduleManager1.addPreFilterInvokeAsync(new Filter4());
        moduleManager1.addPreFilterInvokeAsync(new Filter5());
        moduleManager1.addPreFilterInvokeAsync(new Filter6());
        let responseObj: any = await moduleManager1.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);
        chai.expect(responseObj).to.eq(5);
        chai.expect(logText).to.eq("FILTER4-FILTER2-FILTER6-FILTER1-FILTER3-FILTER5-");
    })

    it("invokeAsync - filter error", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let logText: string = "";

        class Filter1 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER1-";
                    resolve();
                });
            }
        }

        class Filter2 implements IModuleManagerFilter{
            priority: number = 1;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER2-";
                    resolve();
                });
            }
        }

        class Filter3 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER3-";
                    reject(new Error("filter3 error"));
                });
            }
        }

        class Filter4 implements IModuleManagerFilter{
            priority: number = 2;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER4-";
                    resolve();
                });
            }
        }

        class Filter5 implements IModuleManagerFilter{
            priority: number = 0;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER5-";
                    resolve();
                });
            }
        }

        class Filter6 implements IModuleManagerFilter{
            priority: number = 1;
            
            filter(name: string, version: string, method?: string | undefined, parameter?: any[] | undefined, registryName?: string | undefined): Promise<any> {
                return new Promise((resolve, reject)=>{
                    logText += "FILTER6-";
                    resolve();
                });
            }
        }

        moduleManager1.addPreFilterInvokeAsync(new Filter1());
        moduleManager1.addPreFilterInvokeAsync(new Filter2());
        moduleManager1.addPreFilterInvokeAsync(new Filter3());
        moduleManager1.addPreFilterInvokeAsync(new Filter4());
        moduleManager1.addPreFilterInvokeAsync(new Filter5());
        moduleManager1.addPreFilterInvokeAsync(new Filter6());
        try {
            let responseObj: any = await moduleManager1.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);
            throw Error("success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("filter3 error");
            chai.expect(logText).to.eq("FILTER4-FILTER2-FILTER6-FILTER1-FILTER3-FILTER5-");
        }
    })
})