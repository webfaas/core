import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { PackageStoreCacheMemoryAsyncMock } from "./mocks/PackageStoreCacheMemoryAsyncMock";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Manager", () => {
    var packageStoreManager_withoutcache: PackageStoreManager = new PackageStoreManager(undefined, log);
    loadDefaultRegistries(packageStoreManager_withoutcache.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_withoutcache.getCache()).to.null;
    chai.expect(packageStoreManager_withoutcache.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_withcache: PackageStoreManager = new PackageStoreManager(undefined, log);
    packageStoreManager_withcache.setCache(new PackageStoreCacheMemoryAsyncMock());
    loadDefaultRegistries(packageStoreManager_withcache.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_withcache.getCache()).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_withcache.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_2: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), log);
    loadDefaultRegistries(packageStoreManager_2.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_2.getCache()).to.null;
    chai.expect(packageStoreManager_2.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_3: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), log);
    packageStoreManager_3.setCache(new PackageStoreCacheMemoryAsyncMock());
    loadDefaultRegistries(packageStoreManager_3.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_3.getCache()).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_3.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_4: PackageStoreManager = new PackageStoreManager();
    loadDefaultRegistries(packageStoreManager_4.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_4.getCache()).to.null;
    chai.expect(packageStoreManager_4.getPackageRegistryManager()).to.be.an.instanceof(Object);

    it("should return package item on call - without cache configured", function(done){
        packageStoreManager_withoutcache.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@registry1/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("registry1 mock");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                let fileBuffer = packageStore.getItemBuffer("index.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y")).to.gt(-1);
                }
            }

            //force pass in cache
            packageStoreManager_withoutcache.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore2){
                chai.expect(packageStore2).to.be.an.instanceof(Object);
                if (packageStore2){
                    let manifest = packageStore2.getManifest();
                    chai.expect(manifest).to.be.an.instanceof(Object);
                    if (manifest){
                        chai.expect(manifest.name).to.eq("@registry1/mathsum");
                        chai.expect(manifest.version).to.eq("0.0.1");
                        chai.expect(manifest.description).to.eq("registry1 mock");
                        chai.expect(manifest.notfound).to.eq(undefined);
                    }
    
                    let fileBuffer = packageStore2.getItemBuffer("index.js");
                    chai.expect(typeof(fileBuffer)).to.eq("object");
                    if (fileBuffer){
                        chai.expect(fileBuffer.buffer.toString().indexOf("return x + y")).to.gt(-1);
                    }
                }
    
                done();
            }).catch(function(error){
                done(error);
            })
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - with cache configured", function(done){
        packageStoreManager_withcache.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@registry1/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("registry1 mock");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                let fileBuffer = packageStore.getItemBuffer("index.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y")).to.gt(-1);
                }
            }

            //force pass in cache
            packageStoreManager_withcache.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore2){
                chai.expect(packageStore2).to.be.an.instanceof(Object);
                if (packageStore2){
                    let manifest = packageStore2.getManifest();
                    chai.expect(manifest).to.be.an.instanceof(Object);
                    if (manifest){
                        chai.expect(manifest.name).to.eq("@registry1/mathsum");
                        chai.expect(manifest.version).to.eq("0.0.1");
                        chai.expect(manifest.description).to.eq("registry1 mock");
                        chai.expect(manifest.notfound).to.eq(undefined);
                    }
    
                    let fileBuffer = packageStore2.getItemBuffer("index.js");
                    chai.expect(typeof(fileBuffer)).to.eq("object");
                    if (fileBuffer){
                        chai.expect(fileBuffer.buffer.toString().indexOf("return x + y")).to.gt(-1);
                    }
                }
    
                done();
            }).catch(function(error){
                done(error);
            })
        }).catch(function(error){
            done(error);
        })
    })
})