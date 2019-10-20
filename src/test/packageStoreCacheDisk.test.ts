import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";

import { PackageStoreCacheDisk } from "../lib/PackageStoreCache/Disk/PackageStoreCacheDisk";
import { PackageStoreCacheDiskConfig } from "../lib/PackageStoreCache/Disk/PackageStoreCacheDiskConfig";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("PackageStore Cache Disk", () => {
    it("should return object on call", function(){
        var packageStoreCacheDisk1 = new PackageStoreCacheDisk();
        var packageStoreCacheDisk2 = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig());
        chai.expect(packageStoreCacheDisk1.config).to.be.an.instanceof(Object);
        chai.expect(packageStoreCacheDisk2.config).to.be.an.instanceof(Object);
    })
})

describe("PackageStore Cache Disk Config", () => {
    it("should return object on call", function(){
        var config1 = new PackageStoreCacheDiskConfig();
        var config2 = new PackageStoreCacheDiskConfig("/path");
        chai.expect(config1.base.length > 0).to.eq(true);
        chai.expect(config2.base).to.eq("/path");
    })
})

describe("PackageStore Cache Disk Manifest", () => {
    var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
    packageRegistryManager.addRegistry("diskTarball", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStore1: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
                var packageStore2: PackageStore | null;

                chai.expect(packageStore1).to.be.an.instanceof(Object);
            
                if (packageStore1){
                    var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk();
    
                    await packageStoreCacheDisk.putPackageStore(packageStore1);
            
                    packageStore2 = await packageStoreCacheDisk.getPackageStore(packageStore1.getName(), packageStore1.getVersion());
                    chai.expect(packageStore2).to.be.an.instanceof(Object);
            
                    if (packageStore2){
                        var buffer1 = packageStore1.getItemBuffer("package.json");
                        chai.expect(buffer1).to.be.an.instanceof(Buffer);
                        if (buffer1){
                            var buffer2 = packageStore2.getItemBuffer("package.json");
                            chai.expect(buffer2).to.be.an.instanceof(Buffer);
                            if (buffer2){
                                chai.expect(buffer1.equals(buffer2)).to.eq(true);
                            }
                        }
                    }
                }

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })

    it("should return null on call", function(done){
        (async function(){
            try {
                var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk();
                var packageStore1: PackageStore | null = await packageStoreCacheDisk.getPackageStore("notfound***");
                chai.expect(packageStore1).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})

describe("PackageStore Cache Disk Package", () => {
    var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
    packageRegistryManager.addRegistry("diskTarball", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStore1: PackageStore | null = await packageRegistryManager.getPackageStore("semver", "5.6.0");
                var packageStore2: PackageStore | null;

                chai.expect(packageStore1).to.be.an.instanceof(Object);
            
                if (packageStore1){
                    var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk();
    
                    await packageStoreCacheDisk.putPackageStore(packageStore1);
            
                    packageStore2 = await packageStoreCacheDisk.getPackageStore(packageStore1.getName(), packageStore1.getVersion());
                    chai.expect(packageStore2).to.be.an.instanceof(Object);

                    if (packageStore2){
                        var keys: Array<string> = [];
                        packageStore1.getDataPackageItemDataMap().forEach(function(item){
                            keys.push(item.name);
                        })
    
                        for (var i = 0; i < keys.length; i++){
                            var key: string = keys[i];
                            var buffer1 = packageStore1.getItemBuffer(key);
                            chai.expect(buffer1).to.be.an.instanceof(Buffer);
                            if (buffer1){
                                var buffer2 = packageStore2.getItemBuffer(key);
                                chai.expect(buffer2).to.be.an.instanceof(Buffer);
                                if (buffer2){
                                    chai.expect(buffer1.equals(buffer2)).to.eq(true);
                                }
                            }
                        }
                    }
                }

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })

    it("should return null on call", function(done){
        (async function(){
            try {
                var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk();
                var packageStore1: PackageStore | null = await packageStoreCacheDisk.getPackageStore("notfound***", "5.6.0");
                chai.expect(packageStore1).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})