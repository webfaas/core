import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { PackageStore } from "../lib/Core";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Module Manager - Import", () => {
    it("importDependencies - simulate dependency - getPackageStore return null ", async function(){
        try {
            let packageStoreManager_simulate = new PackageStoreManager(packageRegistryManager_default, log);
            let moduleManager_simulate = new ModuleManager(packageStoreManager_simulate, log);
            let packageStore = await moduleManager_simulate.getModuleManagerImport().getPackageStoreManager().getPackageStore("@registry1/mathsumasync", "1.0.0");
            moduleManager_simulate.getModuleManagerImport().getPackageStoreManager().getPackageStore = async function(){
                return null;
            }
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                await moduleManager_simulate.getModuleManagerImport().importDependencies(packageStore);
            }
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("NotFoundError");
        }
    })

    it("importDependencies - simulate throw", async function(){
        try {
            let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, log);
            let moduleManager1 = new ModuleManager(packageStoreManager1, log);
            
            let packageStore = new PackageStore("name1", "version1", "etag");
            packageStore.getManifest = function(){
                throw new Error("internal error")
            }
            await moduleManager1.getModuleManagerImport().importDependencies(packageStore);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("internal error");
        }
    })

    it("importDependencies - simulate throw", async function(){
        try {
            let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, log);
            let moduleManager1 = new ModuleManager(packageStoreManager1, log);
            
            let packageStore = new PackageStore("name1", "version1", "etag");
            packageStore.getManifest = function(){
                throw new Error("internal error")
            }
            await moduleManager1.getModuleManagerImport().importDependencies(packageStore);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("internal error");
        }
    })

    it("importDependencies - whith temporaryContextPackageStoreCache ", async function(){
        let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, log);
        let moduleManager1 = new ModuleManager(packageStoreManager1, log);
        let packageStore = await moduleManager1.getModuleManagerImport().getPackageStoreManager().getPackageStore("@registry1/mathsumasync", "1.0.0");
        chai.expect(packageStore).to.not.null;
        if (packageStore){
            let cachePackageStoreDependenciesItem: any = moduleManager1.getModuleManagerCache().cachePackageStoreBuild();
            await moduleManager1.getModuleManagerImport().importDependencies(packageStore, cachePackageStoreDependenciesItem);
            chai.expect(cachePackageStoreDependenciesItem.listCacheItem.values().next().value.name).to.eq("@registry1/mathsum");
        }
    })

    it("importDependencies - whitout temporaryContextPackageStoreCache ", async function(){
        let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, log);
        let moduleManager1 = new ModuleManager(packageStoreManager1, log);
        let packageStore = await moduleManager1.getModuleManagerImport().getPackageStoreManager().getPackageStore("@registry1/mathsumasync", "1.0.0");
        chai.expect(packageStore).to.not.null;
        if (packageStore){
            await moduleManager1.getModuleManagerImport().importDependencies(packageStore);
        }
    })

    it("importDependencies - version empty ", async function(){
        let packageStoreManager1 = new PackageStoreManager(packageRegistryManager_default, log);
        let moduleManager1 = new ModuleManager(packageStoreManager1, log);
        let packageStore = await moduleManager1.getModuleManagerImport().getPackageStoreManager().getPackageStore("@registry1/mathsumasyncdependencyversionempty", "0.0.1");
        chai.expect(packageStore).to.not.null;
        if (packageStore){
            try {
                await moduleManager1.getModuleManagerImport().importDependencies(packageStore);
                throw new Error("Sucess");
            }
            catch (errTry) {
                chai.expect(errTry.message).to.eq("VERSION NOT FOUND");
            }

        }
    })
})