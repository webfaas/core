import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageRegistryManagerItemStatusEnum } from "../lib/PackageRegistryManager/PackageRegistryManagerItem";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";

export class PackageRegistryError implements IPackageRegistry {
    getManifest(name: string, etag?: string): Promise<import("../lib/PackageRegistry/IPackageRegistryResponse").IPackageRegistryResponse> {
        throw new Error("getManifest not implemented.");
    }
    
    getPackage(name: string, version: string, etag?: string): Promise<import("../lib/PackageRegistry/IPackageRegistryResponse").IPackageRegistryResponse> {
        throw new Error("getPackage not implemented.");
    }
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry Manager", () => {
    var packageRegistryManager_1: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_2: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_3: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_4: PackageRegistryManager = new PackageRegistryManager(log);
    
    packageRegistryManager_1.loadDefaultRegistries();
    packageRegistryManager_3.loadDefaultRegistries();
    packageRegistryManager_4.addRegistry("registry1", new PackageRegistryError());

    chai.expect(packageRegistryManager_1.listRegistry.length > 0).to.eq(true);
    chai.expect(packageRegistryManager_2.listRegistry.length === 0).to.eq(true);
    chai.expect(packageRegistryManager_3.listRegistry.length > 0).to.eq(true);
    chai.expect(packageRegistryManager_4.listRegistry.length === 1).to.eq(true);

    //disable all registry
    packageRegistryManager_3.listRegistry.forEach(function(item){
        item.status = PackageRegistryManagerItemStatusEnum.DISABLED;
    })
    
    it("should return package item on call - loadDefaultRegistries", function(done){
        packageRegistryManager_1.getPackageStore("semver", "5.6.0").then(function(packageStore){
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

    it("should return error - registry not configured", function(done){
        packageRegistryManager_2.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;
            done();
        }).catch(function(error){
            try {
                chai.expect(error.toString()).to.eq("PackageRegistryManager not configured");
                done();
            }
            catch (error2) {
                done(error2);
            }
        })
    })

    it("should return error - loadDefaultRegistries", function(done){
        packageRegistryManager_3.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;
            done();
        }).catch(function(error){
            try {
                chai.expect(error.toString()).to.eq("PackageRegistryManagerItem not available");
                done();
            }
            catch (error2) {
                done(error2);
            }
        })
    })

    it("should return error - custom Registry", function(done){
        packageRegistryManager_4.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;
            done();
        }).catch(function(error){
            try {
                chai.expect(error.message).to.eq("getPackage not implemented.");
                done();
            }
            catch (error2) {
                done(error2);
            }
        })
    })
})