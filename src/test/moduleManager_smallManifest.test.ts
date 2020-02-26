import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);


describe("Module Manager - smallManifest", () => {
    it("getSmallManifest - simulate error", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
        let moduleManager2 = new ModuleManager(undefined, log);

        moduleManager1.getModuleManagerImport().getPackageStoreManager().getPackageStore = function(){
            throw new Error("simulate error");
        }

        moduleManager2.getModuleManagerImport().getPackageStoreManager().getPackageStore = function(){
            let customPackageStore: any = {};
            customPackageStore.getManifest = function(){
                return null;
            }
            return customPackageStore;
        }

        try {
            let responseObj: any = await moduleManager1.getModuleManagerImport().getSmallManifest("package1");
            chai.expect(responseObj).to.eq(Error);
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(Error);
        }

        let responseObj1: any = await moduleManager2.getModuleManagerImport().getSmallManifest("package1");
        chai.expect(responseObj1).to.null;
    })

    it("getSmallManifest - simulate zero versions", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
        
        moduleManager1.getModuleManagerImport().getPackageStoreManager().getPackageStore = function(){
            let customPackageStore: any = {};
            customPackageStore.getManifest = function(){
                let manifest: any = {};
                manifest.name = "test1";
                return manifest;
            }
            return customPackageStore;
        }

        let responseObj: any = await moduleManager1.getModuleManagerImport().getSmallManifest("package1");
        chai.expect(responseObj.name).to.eq("test1");
    })
})