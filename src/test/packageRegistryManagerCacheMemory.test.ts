import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";

import { PackageRegistryManagerCacheMemory } from "../lib/PackageRegistryManager/Caches/Memory/PackageRegistryManagerCacheMemory";
import { PackageRegistryManagerCacheMemoryConfig } from "../lib/PackageRegistryManager/Caches/Memory/PackageRegistryManagerCacheMemoryConfig";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry Manager Cache Memory", () => {
    it("should return object on call", function(){
        var packageRegistryManagerCacheMemory1 = new PackageRegistryManagerCacheMemory();
        var packageRegistryManagerCacheMemory2 = new PackageRegistryManagerCacheMemory(new PackageRegistryManagerCacheMemoryConfig());
        chai.expect(packageRegistryManagerCacheMemory1.config).to.be.an.instanceof(Object);
        chai.expect(packageRegistryManagerCacheMemory2.config).to.be.an.instanceof(Object);
    })
})

describe("Package Registry Manager Cache Memory Config", () => {
    it("should return object on call", function(){
        var config1 = new PackageRegistryManagerCacheMemoryConfig();
        var config2 = new PackageRegistryManagerCacheMemoryConfig(10, 20);
        chai.expect(config1.maxMemory).to.eq(-1);
        chai.expect(config1.maxEntry).to.eq(-1);
        chai.expect(config2.maxMemory).to.eq(10);
        chai.expect(config2.maxEntry).to.eq(20);
    })
})

describe("Package Registry Manager Cache Memory Manifest", () => {
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
                    var packageRegistryManagerCacheMemory: PackageRegistryManagerCacheMemory = new PackageRegistryManagerCacheMemory();
    
                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(0);

                    await packageRegistryManagerCacheMemory.putPackageStore(packageStore1);

                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(1);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(packageStore1.getSize());
            
                    packageStore2 = await packageRegistryManagerCacheMemory.getPackageStore(packageStore1.getName(), packageStore1.getVersion());
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

                    packageRegistryManagerCacheMemory.deletePackageStore("semver");
                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(0);
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
                var packageRegistryManagerCacheMemory: PackageRegistryManagerCacheMemory = new PackageRegistryManagerCacheMemory();
                var packageStore1: PackageStore | null = await packageRegistryManagerCacheMemory.getPackageStore("notfound***");
                chai.expect(packageStore1).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})

describe("Package Registry Manager Cache Memory Package", () => {
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
                    var packageRegistryManagerCacheMemory: PackageRegistryManagerCacheMemory = new PackageRegistryManagerCacheMemory();
    
                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(0);

                    await packageRegistryManagerCacheMemory.putPackageStore(packageStore1);

                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(1);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(packageStore1.getSize());
            
                    packageStore2 = await packageRegistryManagerCacheMemory.getPackageStore(packageStore1.getName(), packageStore1.getVersion());
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

                    packageRegistryManagerCacheMemory.deletePackageStore("semver", "5.6.0");
                    chai.expect(packageRegistryManagerCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageRegistryManagerCacheMemory.getTotalSize()).to.eq(0);
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
                var packageRegistryManagerCacheMemory: PackageRegistryManagerCacheMemory = new PackageRegistryManagerCacheMemory();
                var packageStore1: PackageStore | null = await packageRegistryManagerCacheMemory.getPackageStore("notfound***", "5.6.0");
                chai.expect(packageStore1).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})