import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
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

describe("Module Manager - requireAsync", () => {
    it("requireAsync @registry1/mathsum - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let parentModuleCompileManifestData = new ModuleCompileManifestData("@registry1/mathsum", "0.0.1", "mainfile");

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let moduleManagerRequireContextData_parentnotexist = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreName = "notexist";
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreVersion = "0.0.1";

        let responseObj1: any = await moduleManager1.requireAsync("@registry1/mathsum", "0.0.1", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj1).to.null;

        let responseObj2: any = await moduleManager1.requireAsync("@registry1/mathsum", "0.0.1", moduleManagerRequireContextData);
        chai.expect(responseObj2).to.null;
        
        //load mathsum to cache
        let responseObj_import: any = await moduleManager1.import("@registry1/mathsum", "0.0.1", undefined, undefined, false);
        chai.expect(responseObj_import).to.not.null;
        chai.expect(responseObj_import(2,3)).to.eq(5);

        //
        //moduleManagerRequireContextData_parentnotexist
        //
        let responseObj3_a: any = await moduleManager1.requireAsync("@registry1/mathsum", "", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj3_a).to.null;

        let responseObj3_b: any = await moduleManager1.requireAsync("@registry1/mathsum", "0.0.1", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj3_b).to.not.null;
        chai.expect(responseObj3_b(2,3)).to.eq(5);
    })

    it("requireAsync ./index - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let parentModuleCompileManifestData = new ModuleCompileManifestData("@registry1/mathsum", "0.0.1", "mainfile");

        //load mathsum to cache
        let responseObj_import: any = await moduleManager1.import("@registry1/mathsum", "0.0.1", undefined, undefined, false);
        chai.expect(responseObj_import(2,3)).to.eq(5);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let moduleManagerRequireContextData_parentnotexist = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreName = "notexist";
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreVersion = "0.0.1";
            
        let responseObj1_a: any = await moduleManager1.requireAsync("./index.js", "", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj1_a(2,3)).to.eq(5);
        let responseObj1_b: any = await moduleManager1.requireAsync("./index.js", "0.0.1", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj1_b(2,3)).to.eq(5);

        //
        //moduleManagerRequireContextData_parentnotexist
        //
        let responseObj2_a: any = await moduleManager1.requireAsync("./index.js", "", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj2_a).to.null;
        let responseObj2_b: any = await moduleManager1.requireAsync("./index.js", "0.0.1", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj2_b).to.null;

        let responseObj3_a: any = await moduleManager1.requireAsync("./index.js", "", moduleManagerRequireContextData_parentnotexist);
        chai.expect(responseObj3_a).to.null;
        let responseObj3_b: any = await moduleManager1.requireAsync("./index.js", "0.0.1", moduleManagerRequireContextData_parentnotexist);
        chai.expect(responseObj3_b).to.null;
    })

    it("requireSync moduleManager_compilePackageStoreItemBuffer_return_null", async function(){
        let moduleManager_compilePackageStoreItemBuffer_return_null = new ModuleManager(packageStoreManager_default, log);
        let parentModuleCompileManifestData = new ModuleCompileManifestData("@registry1/mathsum", "0.0.1", "mainfile");

        //load mathsum to cache
        let responseObj_import: any = await moduleManager_compilePackageStoreItemBuffer_return_null.import("@registry1/mathsum", "0.0.1", undefined, undefined, false);
        chai.expect(responseObj_import(2,3)).to.eq(5);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let moduleManagerRequireContextData_parentnotexist = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreName = "notexist";
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreVersion = "0.0.1";
            
        moduleManager_compilePackageStoreItemBuffer_return_null.compilePackageStoreItemBufferSync = function(){
            return null;
        }
        let responseObj9_a: any = await moduleManager_compilePackageStoreItemBuffer_return_null.requireAsync("./index.js", "", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj9_a).to.null;
        let responseObj9_b: any = await moduleManager_compilePackageStoreItemBuffer_return_null.requireAsync("./index.js", "0.0.1", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj9_b).to.null;
    })

    it("requireAsync @registry1/mathsumwasm - 0.0.1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        let parentModuleCompileManifestData = new ModuleCompileManifestData("@registry1/mathsumwasm", "0.0.1", "mainfile");

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsumwasm:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsumwasm";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let moduleManagerRequireContextData_parentnotexist = new ModuleManagerRequireContextData("@registry1/mathsumwasm:0.0.1");
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreName = "notexist";
        moduleManagerRequireContextData_parentnotexist.parentPackageStoreVersion = "0.0.1";

        let responseObj1: any = await moduleManager1.requireAsync("@registry1/mathsumwasm", "0.0.1", moduleManagerRequireContextData, parentModuleCompileManifestData);
        chai.expect(responseObj1).to.null;

        let responseObj2: any = await moduleManager1.requireAsync("@registry1/mathsumwasm", "0.0.1", moduleManagerRequireContextData);
        chai.expect(responseObj2).to.null;
        
        //load mathsum to cache
        let responseObj_import: any = await moduleManager1.import("@registry1/mathsumwasm", "0.0.1", undefined, undefined, false);
        chai.expect(responseObj_import).to.not.null;
        chai.expect(responseObj_import.sum(2,3)).to.eq(5);

        //
        //moduleManagerRequireContextData_parentnotexist
        //
        let responseObj3_a: any = await moduleManager1.requireAsync("@registry1/mathsumwasm", "", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj3_a).to.null;

        let responseObj3_b: any = await moduleManager1.requireAsync("@registry1/mathsumwasm", "0.0.1", moduleManagerRequireContextData_parentnotexist, parentModuleCompileManifestData);
        chai.expect(responseObj3_b).to.not.null;
        chai.expect(responseObj3_b.sum(2,3)).to.eq(5);
    })
})