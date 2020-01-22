import * as chai from "chai";
import * as mocha from "mocha";

import * as os from "os";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { PackageStoreCacheMemory } from "../lib/PackageStoreCache/Memory/PackageStoreCacheMemory";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, undefined, log);

describe("Module Manager", () => {
    it("constructor", function(done){
        let moduleManager1 = new ModuleManager();
        chai.expect(typeof(moduleManager1.getPackageStoreManager())).to.eq("object");

        let packageStoreManager2 = new PackageStoreManager();
        let moduleManager2 = new ModuleManager(packageStoreManager2);
        chai.expect(moduleManager2.getPackageStoreManager()).to.eq(packageStoreManager2);

        done();
    })

    it("addObjectToCache", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        moduleManager1.addObjectToCache("package1", "version1", "item1", "AAA");
        chai.expect(moduleManager1.getObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("AAA");
        moduleManager1.addObjectToCache("package1", "version1", "item1", "BBB");
        chai.expect(moduleManager1.getObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("BBB");
    })

    it("resolveVersion - @registry1/mathsum", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        try {
            let responseObj: any = await moduleManager1.resolveVersion("@registry1/mathsum", "99.*");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }

        try {
            let responseObj: any = await moduleManager1.resolveVersion("@registry1/mathsum", "0.*");
            chai.expect(responseObj).to.eq("0.0.3");
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }
    })

    it("resolveVersion - simulate error", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);

        moduleManager1.getSmallManifest = function(){
            throw new Error("simulate error");
        }

        try {
            let responseObj: any = await moduleManager1.resolveVersion("mathsum", "99.*");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }

        try {
            let responseObj: any = await moduleManager1.resolveVersion("mathsum", "0.*");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }
    })

    it("getSmallManifest - simulate error", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
        let moduleManager2 = new ModuleManager(undefined, log);

        moduleManager1.getPackageStoreManager().getPackageStore = function(){
            throw new Error("simulate error");
        }

        moduleManager2.getPackageStoreManager().getPackageStore = function(){
            let customPackageStore: any = {};
            customPackageStore.getManifest = function(){
                return null;
            }
            return customPackageStore;
        }

        try {
            let responseObj: any = await moduleManager1.getSmallManifest("package1");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }

        let responseObj1: any = await moduleManager2.getSmallManifest("package1");
        chai.expect(responseObj1).to.null;
    })

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

    it("importDependencies - simulate dependency - getPackageStore return null ", async function(){
        try {
            let packageStoreManager_simulate = new PackageStoreManager(packageRegistryManager_default, undefined, log);
            let moduleManager_simulate = new ModuleManager(packageStoreManager_simulate, log);
            let packageStore = await moduleManager_simulate.getPackageStoreManager().getPackageStore("@registry1/mathsumasync", "1.0.0");
            moduleManager_simulate.getPackageStoreManager().getPackageStore = async function(){
                return null;
            }
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                await moduleManager_simulate.importDependencies(packageStore);
            }
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("NotFoundError");
        }
    })

    it("importDependencies - whitout temporaryContextPackageStoreCache ", async function(){
        let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, undefined, log);
        let moduleManager1 = new ModuleManager(packageStoreManager1, log);
        let packageStore = await moduleManager1.getPackageStoreManager().getPackageStore("@registry1/mathsumasync", "1.0.0");
        chai.expect(packageStore).to.not.null;
        if (packageStore){
            await moduleManager1.importDependencies(packageStore, undefined);
        }
    })
})

describe("Module Manager - Import", () => {
    it("import @registry1/mathsum - 0.*", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/mathsum", "0.*");
        chai.expect(responseObj1(2,3)).to.eq(5);

        //force return in cache
        let responseObj2: any = await moduleManager1.import("@registry1/mathsum", "0.*");
        chai.expect(responseObj2(2,3)).to.eq(5);

        //notexist
        try {
            let responseObj3: any = await moduleManager1.import("notexist", "1");
            chai.expect(responseObj3).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }
    })

    it("import @registry1/mathsum - 0.0.3", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj1(2,3)).to.eq(5);

        //force return in cache
        let responseObj2: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj2(2,3)).to.eq(5);

        //notexist
        try {
            let responseObj3: any = await moduleManager1.import("notexist", "1");
            chai.expect(responseObj3).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }
    })

    it("import @registry1/mathsum - 0.0.3", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj1(2,3)).to.eq(5);

        //force return in cache
        let responseObj2: any = await moduleManager1.import("@registry1/mathsum", "0.0.3");
        chai.expect(responseObj2(2,3)).to.eq(5);

        //notexist
        try {
            let responseObj3: any = await moduleManager1.import("notexist", "1");
            chai.expect(responseObj3).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }
    })

    it("import @registry1/hostname - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
            
        let responseObj1: any = await moduleManager1.import("@registry1/hostname", "0.0.1");
        chai.expect(responseObj1()).to.eq(os.hostname());

        //force return in cache
        let responseObj2: any = await moduleManager1.import("@registry1/hostname", "0.0.1");
        chai.expect(responseObj2()).to.eq(os.hostname());

        //notexist
        try {
            let responseObj3: any = await moduleManager1.import("notexist", "1");
            chai.expect(responseObj3).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }
    })

    it("import @registry1/syntaxerror - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        try {
            let responseObj1: any = await moduleManager1.import("@registry1/syntaxerror", "0.0.1");
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("CompileError");
        }

        //force return in cache
        try {
            let responseObj2: any = await moduleManager1.import("@registry1/syntaxerror", "0.0.1");
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("CompileError");
        }

        //notexist
        try {
            let responseObj3: any = await moduleManager1.import("notexist", "1");
            chai.expect(responseObj3).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }
    })
})