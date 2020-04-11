import * as chai from "chai";
import * as path from "path";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { ModuleManagerCache } from "../lib/ModuleManager/ModuleManagerCache";
import { IManifest, PackageStore } from "../lib/Core";

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

    it("addLocalDiskModuleToCache - moduletest1", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let module1FolderPath = path.join(__dirname, "data", "modules", "moduletest1");
        moduleManager1.getModuleManagerCache().addLocalDiskModuleToCache(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getLocalDiskModule().get(PackageStore.parseKey("moduletest1", "1.0.0"))).to.eq(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest1", "1.0.0")).to.not.null;
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest1", "1.0.0")?.name).to.eq("moduletest1");
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest1", "1.0.0")?.version).to.eq("1.0.0");
        let moduleObj: any = moduleManager1.getModuleManagerCache().getCompiledObjectFromCache("moduletest1", "1.0.0", "");
        chai.expect(moduleObj).to.not.null;
        if (moduleObj){
            chai.expect(moduleObj(2,3)).to.eq(5); //sum
        }

        let response = await moduleManager1.invokeAsync("moduletest1", "1.0.0", undefined, [2,3]);
        chai.expect(response).to.eq(5); //sum
    })

    it("addLocalDiskModuleToCache - moduletest2", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let module1FolderPath = path.join(__dirname, "data", "modules", "moduletest2");
        moduleManager1.getModuleManagerCache().addLocalDiskModuleToCache(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getLocalDiskModule().get(PackageStore.parseKey("moduletest2", "1.0.0"))).to.eq(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest2", "1.0.0")).to.not.null;
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest2", "1.0.0")?.name).to.eq("moduletest2");
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest2", "1.0.0")?.version).to.eq("1.0.0");
        let moduleObj: any = moduleManager1.getModuleManagerCache().getCompiledObjectFromCache("moduletest2", "1.0.0", "");
        chai.expect(moduleObj).to.not.null;
        if (moduleObj){
            chai.expect(moduleObj(2,3)).to.eq(6); //multiply
        }

        let response = await moduleManager1.invokeAsync("moduletest2", "1.0.0", undefined, [2,3]);
        chai.expect(response).to.eq(6); //multiply
    })

    it("addLocalDiskModuleToCache - moduletest3 - whitout version", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);

        let module1FolderPath = path.join(__dirname, "data", "modules", "moduletest3");
        moduleManager1.getModuleManagerCache().addLocalDiskModuleToCache(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getLocalDiskModule().get(PackageStore.parseKey("moduletest3", "1.0.0"))).to.eq(module1FolderPath);
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest3", "1.0.0")).to.not.null;
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest3", "1.0.0")?.name).to.eq("moduletest3");
        chai.expect(moduleManager1.getModuleManagerCache().getManifestFromCache("moduletest3", "1.0.0")?.version).to.eq(""); //whitoutversion
        let moduleObj: any = moduleManager1.getModuleManagerCache().getCompiledObjectFromCache("moduletest3", "1.0.0", "");
        chai.expect(moduleObj).to.not.null;
        if (moduleObj){
            chai.expect(moduleObj(2,3)).to.eq(6); //multiply
        }

        let response = await moduleManager1.invokeAsync("moduletest3", "1.0.0", undefined, [2,3]);
        chai.expect(response).to.eq(6); //multiply
    })
})