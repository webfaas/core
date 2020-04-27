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
import { IPackageRegistryResponse } from "../lib/PackageRegistry/IPackageRegistryResponse";
import { IPackageStoreItemData } from "../lib/PackageStore/IPackageStoreItemData";
import { PackageStoreUtil } from "../lib/Util/PackageStoreUtil";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
    packageRegistryManager.addRegistry("REGISTRYERR", "", new PackageRegistryMock.PackageRegistryError());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry Manager - Mock", () => {
    var packageRegistryManager_withoutconfigregistries: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_error: PackageRegistryManager = new PackageRegistryManager(log);

    packageRegistryManager_default.getRegistryNameByExternalRouting = function(moduleName: string): string {
        if (moduleName.indexOf("registry3") > -1){
            return "REGISTRY3";
        }
        else{
            return "";
        }
    }
    
    loadDefaultRegistries(packageRegistryManager_default, log);
    packageRegistryManager_error.addRegistry("REGISTRYERROR", "", new PackageRegistryMock.PackageRegistryError());

    chai.expect(packageRegistryManager_default.getDefaultRegistryName()).to.eq("REGISTRY1");
    chai.expect(packageRegistryManager_default.getRegistry("notfound")).to.be.null;
    chai.expect(packageRegistryManager_default.getRegistry("REGISTRY1")).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry("REGISTRY2")).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry("REGISTRY3")).to.be.not.null;

    chai.expect(packageRegistryManager_error.getDefaultRegistryName()).to.eq("REGISTRYERROR");
    chai.expect(packageRegistryManager_error.getRegistry("notfound")).to.be.null;
    chai.expect(packageRegistryManager_error.getRegistry("REGISTRYERROR")).to.be.not.null;
    packageRegistryManager_error.setDefaultRegistryName("notfound");
    chai.expect(packageRegistryManager_error.getDefaultRegistryName()).to.eq("notfound");

    it("should return package item on call - loadDefaultRegistries", function(done){
        packageRegistryManager_default.getPackageStore("@registry1/simpletext", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@registry1/simpletext");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.txt");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString()).to.eq("AA1");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - loadDefaultRegistries - direct registry REGISTRY2", function(done){
        packageRegistryManager_default.getPackageStore("@registry2/simpletext", "0.0.1", undefined, "REGISTRY2").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@registry2/simpletext");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.txt");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString()).to.eq("AA2");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - loadDefaultRegistries - direct registry REGISTRYERR", function(done){
        packageRegistryManager_default.getPackageStore("@registryerr/simpletext", "0.0.1", undefined, "REGISTRYERR").then(function(packageStore){
            throw new Error("Success!");
        }).catch(function(error){
            try {
                chai.expect(error.message).to.eq("getPackage not implemented.");
                done();
            }
            catch (errTry) {
                done(errTry);
            }
        })
    })

    it("should return package item on call - loadDefaultRegistries - routing", function(done){
        packageRegistryManager_default.getPackageStore("@registry3/simpletext", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@registry3/simpletext");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.txt");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString()).to.eq("AA3");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return error - custom Registry", function(done){
        packageRegistryManager_error.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.null;
            done();
        }).catch(function(error){
            try {
                chai.expect(error.message).to.eq("PackageRegistryManagerItem not available");
                done();
            }
            catch (error2) {
                done(error2);
            }
        })
    })

    it("should return package item on call - withoutconfigregistries", function(done){
        packageRegistryManager_withoutconfigregistries.getPackageStore("@registry1/mathsum", "0.0.1").then(function(packageStore){
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