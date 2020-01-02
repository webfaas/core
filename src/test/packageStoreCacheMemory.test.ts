import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";

import { PackageStoreCacheMemory } from "../lib/PackageStoreCache/Memory/PackageStoreCacheMemory";
import { PackageStoreCacheMemoryConfig } from "../lib/PackageStoreCache/Memory/PackageStoreCacheMemoryConfig";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("PackageStore Cache Memory", () => {
    it("should return object on call", function(){
        var packageStoreCacheMemory1 = new PackageStoreCacheMemory();
        var packageStoreCacheMemory2 = new PackageStoreCacheMemory(new PackageStoreCacheMemoryConfig());
        chai.expect(packageStoreCacheMemory1.config).to.be.an.instanceof(Object);
        chai.expect(packageStoreCacheMemory2.config).to.be.an.instanceof(Object);
    })
})

describe("PackageStore Cache Memory Config", () => {
    it("should return object on call", function(){
        var config1 = new PackageStoreCacheMemoryConfig();
        var config2 = new PackageStoreCacheMemoryConfig(10, 20);
        chai.expect(config1.maxMemory).to.eq(-1);
        chai.expect(config1.maxEntry).to.eq(-1);
        chai.expect(config2.maxMemory).to.eq(10);
        chai.expect(config2.maxEntry).to.eq(20);
    })
})

describe("PackageStore Cache Memory Manifest", () => {
    var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
    packageRegistryManager.addRegistry("diskTarball", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStoreBase: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
                var packageStoreCacheMemoryAsync: PackageStore | null;
                var packageStoreCacheMemorySync: PackageStore | null;

                chai.expect(packageStoreBase).to.be.an.instanceof(Object);
            
                if (packageStoreBase){
                    var packageStoreCacheMemory: PackageStoreCacheMemory = new PackageStoreCacheMemory();
    
                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(0);

                    await packageStoreCacheMemory.putPackageStore(packageStoreBase);

                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(1);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(packageStoreBase.getSize());
            
                    //async
                    packageStoreCacheMemoryAsync = await packageStoreCacheMemory.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);

                    //sync
                    packageStoreCacheMemorySync = packageStoreCacheMemory.getPackageStoreSync(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemorySync).to.be.an.instanceof(Object);
            
                    if (packageStoreCacheMemoryAsync && packageStoreCacheMemorySync){
                        var bufferBase = packageStoreBase.getItemBuffer("package.json");
                        chai.expect(bufferBase?.buffer).to.be.an.instanceof(Buffer);
                        if (bufferBase){
                            //async
                            var bufferMemoryAsync = packageStoreCacheMemoryAsync.getItemBuffer("package.json");
                            chai.expect(bufferMemoryAsync?.buffer).to.be.an.instanceof(Buffer);
                            if (bufferMemoryAsync){
                                chai.expect(bufferBase.buffer.equals(bufferMemoryAsync.buffer)).to.eq(true);
                            }

                            //sync
                            var bufferMemorySync = packageStoreCacheMemorySync.getItemBuffer("package.json");
                            chai.expect(bufferMemorySync?.buffer).to.be.an.instanceof(Buffer);
                            if (bufferMemorySync){
                                chai.expect(bufferBase.buffer.equals(bufferMemorySync.buffer)).to.eq(true);
                            }
                        }
                    }

                    packageStoreCacheMemory.deletePackageStore("semver");
                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(0);
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
                var packageStoreCacheMemory: PackageStoreCacheMemory = new PackageStoreCacheMemory();
                
                //async
                var packageStoreAsync: PackageStore | null = await packageStoreCacheMemory.getPackageStore("notfound***");
                chai.expect(packageStoreAsync).to.be.null;

                //sync
                var packageStoreSync: PackageStore | null = packageStoreCacheMemory.getPackageStoreSync("notfound***");
                chai.expect(packageStoreSync).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})

describe("PackageStore Cache Memory Package", () => {
    var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
    packageRegistryManager.addRegistry("diskTarball", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStoreBase: PackageStore | null = await packageRegistryManager.getPackageStore("semver", "5.6.0");
                var packageStoreCacheMemoryAsync: PackageStore | null;
                var packageStoreCacheMemorySync: PackageStore | null;

                chai.expect(packageStoreBase).to.be.an.instanceof(Object);
            
                if (packageStoreBase){
                    var packageStoreCacheMemory: PackageStoreCacheMemory = new PackageStoreCacheMemory();
    
                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(0);

                    await packageStoreCacheMemory.putPackageStore(packageStoreBase);

                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(1);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(packageStoreBase.getSize());
            
                    //async
                    packageStoreCacheMemoryAsync = await packageStoreCacheMemory.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);

                    //sync
                    packageStoreCacheMemorySync = packageStoreCacheMemory.getPackageStoreSync(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemorySync).to.be.an.instanceof(Object);

                    if (packageStoreCacheMemoryAsync && packageStoreCacheMemorySync){
                        var keys: Array<string> = [];
                        packageStoreBase.getDataPackageItemDataMap().forEach(function(item){
                            keys.push(item.name);
                        })
    
                        for (var i = 0; i < keys.length; i++){
                            var key: string = keys[i];
                            var bufferBase = packageStoreBase.getItemBuffer(key);
                            chai.expect(bufferBase?.buffer).to.be.an.instanceof(Buffer);
                            if (bufferBase){
                                //async
                                var bufferMemoryAsync = packageStoreCacheMemoryAsync.getItemBuffer(key);
                                chai.expect(bufferMemoryAsync?.buffer).to.be.an.instanceof(Buffer);
                                if (bufferMemoryAsync){
                                    chai.expect(bufferBase.buffer.equals(bufferMemoryAsync.buffer)).to.eq(true);
                                }

                                //sync
                                var bufferMemorySync = packageStoreCacheMemorySync.getItemBuffer(key);
                                chai.expect(bufferMemorySync?.buffer).to.be.an.instanceof(Buffer);
                                if (bufferMemorySync){
                                    chai.expect(bufferBase.buffer.equals(bufferMemorySync.buffer)).to.eq(true);
                                }
                            }
                        }
                    }

                    packageStoreCacheMemory.deletePackageStore("semver", "5.6.0");
                    chai.expect(packageStoreCacheMemory.getTotalEntry()).to.eq(0);
                    chai.expect(packageStoreCacheMemory.getTotalSize()).to.eq(0);
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
                var packageStoreCacheMemory: PackageStoreCacheMemory = new PackageStoreCacheMemory();

                //async
                var packageStoreAsync: PackageStore | null = await packageStoreCacheMemory.getPackageStore("notfound***", "5.6.0");
                chai.expect(packageStoreAsync).to.be.null;

                //sync
                var packageStoreSync: PackageStore | null = packageStoreCacheMemory.getPackageStoreSync("notfound***", "5.6.0");
                chai.expect(packageStoreSync).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})