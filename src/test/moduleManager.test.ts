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
import { IRequirePackageInfoTarget } from "../lib/ModuleManager/IRequirePackageInfoTarget";

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
        chai.expect(typeof(moduleManager1.getModuleManagerImport().getPackageStoreManager())).to.eq("object");

        let packageStoreManager2 = new PackageStoreManager();
        let moduleManager2 = new ModuleManager(packageStoreManager2);
        chai.expect(moduleManager2.getModuleManagerImport().getPackageStoreManager()).to.eq(packageStoreManager2);

        done();
    })

    it("semver", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let semver = new SmallSemver();
        moduleManager1.getModuleManagerImport().setSemver(semver);
        chai.expect(moduleManager1.getModuleManagerImport().getSemver()).to.eq(semver);
    })

    it("resolveVersion - @registry1/mathsum", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        try {
            let responseObj: any = await moduleManager1.getModuleManagerImport().resolveVersion("@registry1/mathsum", "99.*");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
        }

        try {
            let responseObj: any = await moduleManager1.getModuleManagerImport().resolveVersion("@registry1/mathsum", "0.*");
            chai.expect(responseObj).to.eq("0.0.3");
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }
    })

    it("resolveVersion - simulate error", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);

        moduleManager1.getModuleManagerImport().getSmallManifest = function(){
            throw new Error("simulate error");
        }

        try {
            let responseObj: any = await moduleManager1.getModuleManagerImport().resolveVersion("mathsum", "99.*");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }

        try {
            let responseObj: any = await moduleManager1.getModuleManagerImport().resolveVersion("mathsum", "0.*");
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
            await moduleManager1.getModuleManagerCompile().compilePackageWasmAsync(moduleManagerRequireContextData, moduleCompileManifestData, Buffer.from("AAAA"));
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message.indexOf("expected")).to.gt(-1);
        }
    })

    it("processModuleCompiledToCache - default", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let packageInfoTarget = {} as IRequirePackageInfoTarget;
        moduleManager1.onProcessModuleCompiledToCache(packageInfoTarget, null, null);
    })
})