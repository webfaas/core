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
import { PackageStoreUtil } from "../lib/PackageStore/PackageStoreUtil";

export class PackageRegistryError implements IPackageRegistry {
    getTypeName(): string{
        return "REGISTRYERROR";
    }
    getManifest(name: string, etag?: string): Promise<import("../lib/PackageRegistry/IPackageRegistryResponse").IPackageRegistryResponse> {
        throw new Error("getManifest not implemented.");
    }
    getPackage(name: string, version: string, etag?: string): Promise<import("../lib/PackageRegistry/IPackageRegistryResponse").IPackageRegistryResponse> {
        throw new Error("getPackage not implemented.");
    }
    start(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    stop(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

class CustomPackageResponseRegistry implements IPackageRegistryResponse{
    etag: string = "";
    packageStore: PackageStore | null = null;

    constructor(name?: string, version?: string, etag?: string, prefixBufferString = 'AAABBBCCC'){
        this.etag = etag || "";

        var itemData: IPackageStoreItemData;
        var buffer1: Buffer = Buffer.from(prefixBufferString.substring(0,9) + '{"name":"name1", "version":"1.0.0", "main":"file1.js"}');
        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
        
        itemData = PackageStoreUtil.buildItemData("file1.js", 0, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file2.js", 3, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("file3.js", 6, 3);
        dataPackageItemDataMap.set(itemData.name, itemData);

        itemData = PackageStoreUtil.buildItemData("package.json", 9, 62);
        dataPackageItemDataMap.set(itemData.name, itemData);

        this.packageStore = new PackageStore(name || "package1", version || "version1", etag || "", buffer1, dataPackageItemDataMap);
    }
}

class PackageRegistry1 implements IPackageRegistry {
    getTypeName(): string{
        return "REGISTRY1";
    }
    async getManifest(name: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, etag, undefined, "AA1BB1CC1");
    }
    async getPackage(name: string, version: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, version, etag, "AA1BB1CC1");
    }
    async start() {
    }
    async stop() {
    }
}

class PackageRegistry2 implements IPackageRegistry {
    getTypeName(): string{
        return "REGISTRY2";
    }
    async getManifest(name: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, undefined, etag, "AA2BB2CC2");
    }
    async getPackage(name: string, version: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, version, etag, "AA2BB2CC2");
    }
    async start() {
    }
    async stop() {
    }
}

class PackageRegistry3 implements IPackageRegistry {
    getTypeName(): string{
        return "REGISTRY3";
    }
    async getManifest(name: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, undefined, etag, "AA3BB3CC3");
    }
    async getPackage(name: string, version: string, etag?: string) {
        return new CustomPackageResponseRegistry(name, version, etag, "AA3BB3CC3");
    }
    async start() {
    }
    async stop() {
    }
}

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "0.0.1", new PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "0.0.2", new PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "0.0.3", new PackageRegistry3());
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
    packageRegistryManager_error.addRegistry("REGISTRYERROR", "", new PackageRegistryError());

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
        packageRegistryManager_default.getPackageStore("file1", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("name1");
                    chai.expect(manifest.version).to.eq("1.0.0");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.js");
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
        packageRegistryManager_default.getPackageStore("file1", "0.0.2", undefined, "REGISTRY2").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("name1");
                    chai.expect(manifest.version).to.eq("1.0.0");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.js");
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

    it("should return package item on call - loadDefaultRegistries - routing", function(done){
        packageRegistryManager_default.getPackageStore("@registry3/file1", "0.0.3").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("name1");
                    chai.expect(manifest.version).to.eq("1.0.0");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("file1.js");
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
        packageRegistryManager_error.getPackageStore("semver", "5.6.0").then(function(packageStore){
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