import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { ModuleManagerCache } from "../lib/ModuleManager/ModuleManagerCache";
import { IManifest } from "../lib/Core";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager Cache", () => {
    it("constructor", async function(){
        let moduleManagerCache = new ModuleManagerCache();
        let moduleManagerCache2 = new ModuleManagerCache(log);
    })

    it("addObjectToCache", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        moduleManager1.getModuleManagerCache().addCompiledObjectToCache("package1", "version1", "item1", "AAA");
        chai.expect(moduleManager1.getModuleManagerCache().getCompiledObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("AAA");
        moduleManager1.getModuleManagerCache().addCompiledObjectToCache("package1", "version1", "item1", "BBB");
        chai.expect(moduleManager1.getModuleManagerCache().getCompiledObjectFromCache("package1", "version1", "item1")?.toString()).to.eq("BBB");
        chai.expect(moduleManager1.getModuleManagerCache().getCacheModule().size).to.eq(1);

        let manifest1 = {} as IManifest;
        manifest1.name = "package1";
        moduleManager1.getModuleManagerCache().addManifestToCache("package1", "version1", manifest1);
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("package1", "version1")?.name).to.eq("package1");
        chai.expect(moduleManager1.getModuleManagerCache().getCacheModule().size).to.eq(1);
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("notfound", "version1")).to.null;

        moduleManager1.getModuleManagerCache().cleanCacheModule();
        chai.expect(moduleManager1.getModuleManagerCache().getCacheModule().size).to.eq(0);
    })
})