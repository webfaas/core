import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { SmallSemver } from "../lib/Semver/SmallSemver";
import { ModuleManagerRequireContextData } from "../lib/ModuleManager/ModuleManagerRequireContextData";
import { ModuleCompileManifestData } from "../lib/ModuleCompile/ModuleCompileManifestData";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager", () => {
    it("constructor", function(done){
        let moduleManager1 = new ModuleManager();
        chai.expect(typeof(moduleManager1.getPackageStoreManager())).to.eq("object");

        let packageStoreManager2 = new PackageStoreManager();
        let moduleManager2 = new ModuleManager(packageStoreManager2);
        chai.expect(moduleManager2.getPackageStoreManager()).to.eq(packageStoreManager2);

        done();
    })

    it("semver", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let semver = new SmallSemver();
        moduleManager1.setSemver(semver);
        chai.expect(moduleManager1.getSemver()).to.eq(semver);
    })

    it("addObjectToCache", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        moduleManager1.addCompiledObjectToCache("package1", "version1", "item1", "AAA");
        chai.expect(moduleManager1.getCompiledObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("AAA");
        moduleManager1.addCompiledObjectToCache("package1", "version1", "item1", "BBB");
        chai.expect(moduleManager1.getCompiledObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("BBB");
        chai.expect(moduleManager1.getCacheCompiledObject().size).to.eq(1);
        moduleManager1.cleanCacheObjectCompiled();
        chai.expect(moduleManager1.getCacheCompiledObject().size).to.eq(0);
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

    it("compilePackageWasmAsync - simulate error", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsumwasm:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsumwasm";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let moduleCompileManifestData = new ModuleCompileManifestData("@registry1/mathsumwasm", "0.0.1", "");
        try {
            await moduleManager1.compilePackageWasmAsync(moduleManagerRequireContextData, moduleCompileManifestData, Buffer.from("AAAA"));
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message.indexOf("expected")).to.gt(-1);
        }
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
})