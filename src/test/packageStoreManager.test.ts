import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageStoreCacheMemory } from "../lib/PackageStoreCache/Memory/PackageStoreCacheMemory";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Manager", () => {
    var packageStoreManager_1: PackageStoreManager = new PackageStoreManager(undefined, undefined, log);
    chai.expect(packageStoreManager_1.cache).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_1.packageRegistryManager).to.be.an.instanceof(Object);

    var packageStoreManager_2: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), undefined, log);
    chai.expect(packageStoreManager_2.cache).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_2.packageRegistryManager).to.be.an.instanceof(Object);

    var packageStoreManager_3: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), new PackageStoreCacheMemory(), log);
    chai.expect(packageStoreManager_3.cache).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_3.packageRegistryManager).to.be.an.instanceof(Object);

    var packageStoreManager_4: PackageStoreManager = new PackageStoreManager();
    chai.expect(packageStoreManager_4.cache).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_4.packageRegistryManager).to.be.an.instanceof(Object);

    var packageStoreManager_not_cache: PackageStoreManager = new PackageStoreManager();
    packageStoreManager_not_cache.cache = null;

    var packageStoreManager_not_packageRegistryManager: PackageStoreManager = new PackageStoreManager();
    packageStoreManager_not_packageRegistryManager.packageRegistryManager = null;
    
    it("should return package item on call", function(done){
        packageStoreManager_1.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
                    chai.expect(manifest.version).to.eq("5.6.0");
                    chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            //force pass in cache
            packageStoreManager_1.getPackageStore("semver", "5.6.0").then(function(packageStore){
                chai.expect(packageStore).to.be.an.instanceof(Object);
                if (packageStore){
                    var manifest = packageStore.getManifest();
                    chai.expect(manifest).to.be.an.instanceof(Object);
                    if (manifest){
                        chai.expect(manifest.name).to.eq("semver");
                        chai.expect(manifest.version).to.eq("5.6.0");
                        chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                        chai.expect(manifest.notfound).to.eq(undefined);
                    }
    
                    var fileBuffer = packageStore.getItemBuffer("semver.js");
                    chai.expect(typeof(fileBuffer)).to.eq("object");
                    if (fileBuffer){
                        chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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

    it("should return package item on call - not cache", function(done){
        packageStoreManager_not_cache.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
                    chai.expect(manifest.version).to.eq("5.6.0");
                    chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - not packageRegistryManager", function(done){
        packageStoreManager_not_packageRegistryManager.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;

            done();
        }).catch(function(error){
            done(error);
        })
    })
})