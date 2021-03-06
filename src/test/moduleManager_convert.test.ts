import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { ModuleManagerRequireContextData } from "../lib/ModuleManager/ModuleManagerRequireContextData";
import { IRequirePackageInfoTarget } from "../lib/ModuleManager/IRequirePackageInfoTarget";
import { PackageStoreCacheMemorySync } from "../lib/PackageStoreCache/Memory/PackageStoreCacheMemorySync";
import { PackageStore, ModuleNameUtil } from "../lib/Core";
import { ModuleManagerConvert } from "../lib/ModuleManager/ModuleManagerConvert";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

const moduleManagerConvert = new ModuleManagerConvert();

describe("Module Manager - Convert", () => {
    it("with itemKey", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let packageStoreCacheMemorySync1 = new PackageStoreCacheMemorySync()
        let packageStore1 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore1.addItemBuffer("index.txt", Buffer.from("AA"));
        packageStoreCacheMemorySync1.putPackageStore(packageStore1);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let packageInfoTarget1 = {} as IRequirePackageInfoTarget;
        packageInfoTarget1.packageName = "@registry1/mathsum";
        packageInfoTarget1.packageVersion = "0.0.1";
        packageInfoTarget1.itemKey = "index.txt";
        packageInfoTarget1.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget1.packageName, "");
        let resp1 = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp1).to.not.null;
        if (resp1){
            chai.expect(resp1?.packageStoreItemBufferResponse).to.not.null;
            if (resp1?.packageStoreItemBufferResponse){
                chai.expect(resp1?.packageStoreItemBufferResponse.buffer.toString()).to.eq("AA");
            }
        }

        let packageInfoTarget_notfound = {} as IRequirePackageInfoTarget;
        packageInfoTarget_notfound.packageName = "@registry1/mathsum";
        packageInfoTarget_notfound.packageVersion = "0.0.1";
        packageInfoTarget_notfound.itemKey = "notfound";
        packageInfoTarget_notfound.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget_notfound.packageName, "");
        let resp_notfound = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget_notfound, moduleManagerRequireContextData);
        chai.expect(resp_notfound).to.null;
    })

    it("without itemKey", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let packageStoreCacheMemorySync1 = new PackageStoreCacheMemorySync()
        let packageStore1 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore1.addItemBuffer("index.js", Buffer.from("AA"));
        packageStoreCacheMemorySync1.putPackageStore(packageStore1);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let packageInfoTarget1 = {} as IRequirePackageInfoTarget;
        packageInfoTarget1.packageName = "@registry1/mathsum";
        packageInfoTarget1.packageVersion = "0.0.1";
        packageInfoTarget1.itemKey = "";
        packageInfoTarget1.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget1.packageName, "");
        let resp1 = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp1).to.not.null;
        if (resp1){
            chai.expect(resp1?.packageStoreItemBufferResponse).to.not.null;
            if (resp1?.packageStoreItemBufferResponse){
                chai.expect(resp1?.packageStoreItemBufferResponse.buffer.toString()).to.eq("AA");
            }
        }

        let packageStoreCacheMemorySync2 = new PackageStoreCacheMemorySync()
        let packageStore2 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore2.addItemBuffer("index2.js", Buffer.from("AA"));
        packageStoreCacheMemorySync2.putPackageStore(packageStore2);
        let resp_notfound = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync2, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp_notfound).to.null;
    })

    it("without itemKey - filename", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let packageStoreCacheMemorySync1 = new PackageStoreCacheMemorySync()
        let packageStore1 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore1.addItemBuffer("index.js", Buffer.from("AA"));
        packageStoreCacheMemorySync1.putPackageStore(packageStore1);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let packageInfoTarget1 = {} as IRequirePackageInfoTarget;
        packageInfoTarget1.packageName = "@registry1/mathsum";
        packageInfoTarget1.packageVersion = "0.0.1";
        packageInfoTarget1.itemKey = "";
        packageInfoTarget1.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget1.packageName, "index.js");
        let resp1 = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp1).to.not.null;
        if (resp1){
            chai.expect(resp1?.packageStoreItemBufferResponse).to.not.null;
            if (resp1?.packageStoreItemBufferResponse){
                chai.expect(resp1?.packageStoreItemBufferResponse.buffer.toString()).to.eq("AA");
            }
        }
    })

    it("without itemKey - dependency - packageVersion empty", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let packageStoreCacheMemorySync1 = new PackageStoreCacheMemorySync()
        let packageStore1 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore1.addItemBuffer("index.js", Buffer.from("AA"));
        packageStoreCacheMemorySync1.putPackageStore(packageStore1);

        let packageStore2 = new PackageStore("@registry1/mathsum2", "0.0.1", "");
        packageStore2.addItemBuffer("index.js", Buffer.from("AA"));
        packageStore2.addItemBuffer("package.json", Buffer.from(JSON.stringify({dependencies: {"@registry1/mathsum": "0.0.1"}})));
        packageStoreCacheMemorySync1.putPackageStore(packageStore2);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum2:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum2";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let packageInfoTarget1 = {} as IRequirePackageInfoTarget;
        packageInfoTarget1.packageName = "@registry1/mathsum2";
        packageInfoTarget1.packageVersion = "";
        packageInfoTarget1.itemKey = "";
        packageInfoTarget1.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget1.packageName, "");
        let resp1 = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp1).to.null;
    })

    it("without itemKey - dependency - packageVersion empty - dependencies empty", async function(){
        let moduleManager1 = new ModuleManager(packageStoreManager_default, log);
        
        let packageStoreCacheMemorySync1 = new PackageStoreCacheMemorySync()
        let packageStore1 = new PackageStore("@registry1/mathsum", "0.0.1", "");
        packageStore1.addItemBuffer("index.js", Buffer.from("AA"));
        packageStoreCacheMemorySync1.putPackageStore(packageStore1);

        let packageStore2 = new PackageStore("@registry1/mathsum2", "0.0.1", "");
        packageStore2.addItemBuffer("index.js", Buffer.from("AA"));
        packageStore2.addItemBuffer("package.json", Buffer.from(JSON.stringify({})));
        packageStoreCacheMemorySync1.putPackageStore(packageStore2);

        let moduleManagerRequireContextData = new ModuleManagerRequireContextData("@registry1/mathsum2:0.0.1");
        moduleManagerRequireContextData.parentPackageStoreName = "@registry1/mathsum2";
        moduleManagerRequireContextData.parentPackageStoreVersion = "0.0.1";

        let packageInfoTarget1 = {} as IRequirePackageInfoTarget;
        packageInfoTarget1.packageName = "@registry1/mathsum2";
        packageInfoTarget1.packageVersion = "";
        packageInfoTarget1.itemKey = "";
        packageInfoTarget1.nameParsedObj = ModuleNameUtil.parse(packageInfoTarget1.packageName, "");
        let resp1 = moduleManagerConvert.convertToCodeBufferResponse(packageStoreCacheMemorySync1, packageInfoTarget1, moduleManagerRequireContextData);
        chai.expect(resp1).to.null;
    })
})