import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageRegistryManagerItem } from "../lib/PackageRegistryManager/PackageRegistryManagerItem";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryGitHubTarballV3 } from "../lib/PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("NPM", "", new PackageRegistryNPM(undefined, log));
    packageRegistryManager.addRegistry("DISK", "", new PackageRegistryDiskTarball(undefined, log));
    packageRegistryManager.addRegistry("GITHUB", "", new PackageRegistryGitHubTarballV3(undefined, log));
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry Manager", () => {
    var packageRegistryManager_withoutconfigregistries: PackageRegistryManager  = new PackageRegistryManager(log);
    var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
    
    loadDefaultRegistries(packageRegistryManager_default, log);
    
    chai.expect(packageRegistryManager_default.getDefaultRegistryName()).to.eq("NPM");
    chai.expect(packageRegistryManager_default.getRegistry("notfound")).to.be.null;
    chai.expect(packageRegistryManager_default.getRegistry("NPM")).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry("DISK")).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry("GITHUB")).to.be.not.null;

    it("should return package item on call - loadDefaultRegistries", function(done){
        packageRegistryManager_default.getPackageStore("semver", "5.6.0").then(function(packageStore){
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

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - loadDefaultRegistries - route by github", function(done){
        packageRegistryManager_default.getPackageStore("@webfaaslabs/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("sum x + y");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("src/lib/index.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y;") > 0).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - loadDefaultRegistries - direct registry github", function(done){
        packageRegistryManager_default.getPackageStore("@webfaaslabs/mathsum", "0.0.1", undefined, "GITHUB").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("sum x + y");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("src/lib/index.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y;") > 0).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - withoutconfigregistries", function(done){
        packageRegistryManager_withoutconfigregistries.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;
            done();
        }).catch(function(error){
            try {
                chai.expect(error.message).to.eq("PackageRegistryManager not configured");
                done();
            }
            catch (error2) {
                done(error2);
            }
        })
    })
})