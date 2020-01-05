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
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("NPM", "", new PackageRegistryNPM(undefined, log));
    //packageRegistryManager.addRegistry("DISK", "", new PackageRegistryDiskTarball(undefined, log));
    //packageRegistryManager.addRegistry("GITHUB", "", new PackageRegistryGitHubTarballV3(undefined, log));
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Manager", () => {
    var packageStoreManager_withoutcache: PackageStoreManager = new PackageStoreManager(undefined, undefined, log);
    loadDefaultRegistries(packageStoreManager_withoutcache.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_withoutcache.getCache()).to.null;
    chai.expect(packageStoreManager_withoutcache.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_withcache: PackageStoreManager = new PackageStoreManager(undefined, new PackageStoreCacheMemory(), log);
    loadDefaultRegistries(packageStoreManager_withcache.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_withcache.getCache()).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_withcache.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_2: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), undefined, log);
    loadDefaultRegistries(packageStoreManager_2.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_2.getCache()).to.null;
    chai.expect(packageStoreManager_2.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_3: PackageStoreManager = new PackageStoreManager(new PackageRegistryManager(), new PackageStoreCacheMemory(), log);
    loadDefaultRegistries(packageStoreManager_3.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_3.getCache()).to.be.an.instanceof(Object);
    chai.expect(packageStoreManager_3.getPackageRegistryManager()).to.be.an.instanceof(Object);

    var packageStoreManager_4: PackageStoreManager = new PackageStoreManager();
    loadDefaultRegistries(packageStoreManager_4.getPackageRegistryManager(), log);
    chai.expect(packageStoreManager_4.getCache()).to.null;
    chai.expect(packageStoreManager_4.getPackageRegistryManager()).to.be.an.instanceof(Object);

    it("should return package item on call - without cache configured", function(done){
        packageStoreManager_withoutcache.getPackageStore("semver", "5.6.0").then(function(packageStore){
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
                    chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            //force pass in cache
            packageStoreManager_withoutcache.getPackageStore("semver", "5.6.0").then(function(packageStore2){
                chai.expect(packageStore2).to.be.an.instanceof(Object);
                if (packageStore2){
                    var manifest = packageStore2.getManifest();
                    chai.expect(manifest).to.be.an.instanceof(Object);
                    if (manifest){
                        chai.expect(manifest.name).to.eq("semver");
                        chai.expect(manifest.version).to.eq("5.6.0");
                        chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                        chai.expect(manifest.notfound).to.eq(undefined);
                    }
    
                    var fileBuffer = packageStore2.getItemBuffer("semver.js");
                    chai.expect(typeof(fileBuffer)).to.eq("object");
                    if (fileBuffer){
                        chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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
        packageStoreManager_withcache.getPackageStore("semver", "5.6.0").then(function(packageStore){
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
                    chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            //force pass in cache
            packageStoreManager_withcache.getPackageStore("semver", "5.6.0").then(function(packageStore2){
                chai.expect(packageStore2).to.be.an.instanceof(Object);
                if (packageStore2){
                    var manifest = packageStore2.getManifest();
                    chai.expect(manifest).to.be.an.instanceof(Object);
                    if (manifest){
                        chai.expect(manifest.name).to.eq("semver");
                        chai.expect(manifest.version).to.eq("5.6.0");
                        chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                        chai.expect(manifest.notfound).to.eq(undefined);
                    }
    
                    var fileBuffer = packageStore2.getItemBuffer("semver.js");
                    chai.expect(typeof(fileBuffer)).to.eq("object");
                    if (fileBuffer){
                        chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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