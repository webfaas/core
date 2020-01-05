import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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
        var packageStoreCacheDisk1 = new PackageStoreCacheDisk(undefined, log);
        var packageStoreCacheDisk2 = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(), log);
        var packageStoreCacheDisk3 = new PackageStoreCacheDisk();
        chai.expect(packageStoreCacheDisk1.config).to.be.an.instanceof(Object);
        chai.expect(packageStoreCacheDisk2.config).to.be.an.instanceof(Object);
        chai.expect(packageStoreCacheDisk3.config).to.be.an.instanceof(Object);
    })

    it("should return error in putPackageStore - not exist folder", function(done){
        (async function(){
            let tempFolder = path.join(os.tmpdir(), "notexist-" + new Date().getTime(), "-webfaas-core-manifest-" + new Date().getTime()); //force not exist folder
            try {
                var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
                var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
                packageRegistryManager.addRegistry("diskTarball", "", packageRegistryDiskTarball);

                var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(tempFolder), log);
                var packageStore1: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
                
                if (packageStore1){
                    await packageStoreCacheDisk.putPackageStore(packageStore1);
                }
                
                throw new Error("expected catch");
            }
            catch (errTry) {
                try {
                    chai.expect(errTry.message).to.not.eq("expected catch");
                    done();
                }
                catch (errTry2) {
                    done(errTry2);
                }
            }
        })();
    })
})

it("should return error in putPackageStore - permission denied - 000", function(done){
    (async function(){
        try {
            let tempFolder = path.join(os.tmpdir(), "webfaas-core-denied-000-" + new Date().getTime());
            fs.mkdirSync(tempFolder);
            fs.chmodSync(tempFolder, "000");

            var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
            var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
            packageRegistryManager.addRegistry("diskTarball", "", packageRegistryDiskTarball);

            var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(tempFolder), log);
            var packageStore1: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
            
            if (packageStore1){
                await packageStoreCacheDisk.putPackageStore(packageStore1);
            }
            
            throw new Error("expected catch");
        }
        catch (errTry) {
            try {
                chai.expect(errTry.message).to.not.eq("expected catch");
                done();
            }
            catch (errTry2) {
                done(errTry2);
            }
        }
    })();
})

it("should return error in putPackageStore - permission denied - 444", function(done){
    (async function(){
        try {
            let tempFolder = path.join(os.tmpdir(), "webfaas-core-denied-444-" + new Date().getTime());
            fs.mkdirSync(tempFolder);
            fs.chmodSync(tempFolder, "444");

            var packageRegistryManager: PackageRegistryManager = new PackageRegistryManager(log);
            var packageRegistryDiskTarball: PackageRegistryDiskTarball = new PackageRegistryDiskTarball(new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package")));
            packageRegistryManager.addRegistry("diskTarball", "", packageRegistryDiskTarball);

            var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(tempFolder), log);
            var packageStore1: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
            
            if (packageStore1){
                await packageStoreCacheDisk.putPackageStore(packageStore1);
            }
            
            throw new Error("expected catch");
        }
        catch (errTry) {
            try {
                chai.expect(errTry.message).to.not.eq("expected catch");
                done();
            }
            catch (errTry2) {
                done(errTry2);
            }
        }
    })();
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
    var tempFolder = path.join(os.tmpdir(), "webfaas-core-manifest-" + new Date().getTime()); //force nonexistent folder
    packageRegistryManager.addRegistry("diskTarball", "", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStoreBase: PackageStore | null = await packageRegistryManager.getPackageStore("semver");
                var packageStoreCacheMemoryAsync: PackageStore | null;
                var packageStoreCacheMemorySync: PackageStore | null;

                chai.expect(packageStoreBase).to.be.an.instanceof(Object);
            
                if (packageStoreBase){
                    var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(tempFolder), log);
    
                    await packageStoreCacheDisk.putPackageStore(packageStoreBase);
            
                    //async
                    packageStoreCacheMemoryAsync = await packageStoreCacheDisk.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);

                    //sync
                    packageStoreCacheMemorySync = packageStoreCacheDisk.getPackageStoreSync(packageStoreBase.getName(), packageStoreBase.getVersion());
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

                    //replace
                    await packageStoreCacheDisk.putPackageStore(packageStoreBase);
                    packageStoreCacheMemoryAsync = await packageStoreCacheDisk.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);
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
                var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(undefined, log);

                //async
                var packageStoreAsync: PackageStore | null = await packageStoreCacheDisk.getPackageStore("notfound***");
                chai.expect(packageStoreAsync).to.be.null;

                //sync
                var packageStoreSync: PackageStore | null = packageStoreCacheDisk.getPackageStoreSync("notfound***");
                chai.expect(packageStoreSync).to.be.null;

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
    var tempFolder = path.join(os.tmpdir(), "webfaas-core-package-" + new Date().getTime()); //force nonexistent folder
    packageRegistryManager.addRegistry("diskTarball", "", packageRegistryDiskTarball);

    it("should return object on call", function(done){
        (async function(){
            try {
                var packageStoreBase: PackageStore | null = await packageRegistryManager.getPackageStore("semver", "5.6.0");
                var packageStoreCacheMemoryAsync: PackageStore | null;
                var packageStoreCacheMemorySync: PackageStore | null;

                chai.expect(packageStoreBase).to.be.an.instanceof(Object);
            
                if (packageStoreBase){
                    var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(new PackageStoreCacheDiskConfig(tempFolder), log);
    
                    await packageStoreCacheDisk.putPackageStore(packageStoreBase);
            
                    //async
                    packageStoreCacheMemoryAsync = await packageStoreCacheDisk.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);

                    //sync
                    packageStoreCacheMemorySync = packageStoreCacheDisk.getPackageStoreSync(packageStoreBase.getName(), packageStoreBase.getVersion());
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

                    //replace
                    await packageStoreCacheDisk.putPackageStore(packageStoreBase);
                    packageStoreCacheMemoryAsync = await packageStoreCacheDisk.getPackageStore(packageStoreBase.getName(), packageStoreBase.getVersion());
                    chai.expect(packageStoreCacheMemoryAsync).to.be.an.instanceof(Object);
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
                var packageStoreCacheDisk: PackageStoreCacheDisk = new PackageStoreCacheDisk(undefined, log);

                //async
                var packageStoreAsync: PackageStore | null = await packageStoreCacheDisk.getPackageStore("notfound***", "5.6.0");
                chai.expect(packageStoreAsync).to.be.null;

                //sync
                var packageStoreSync: PackageStore | null = packageStoreCacheDisk.getPackageStoreSync("notfound***", "5.6.0");
                chai.expect(packageStoreSync).to.be.null;

                done();
            }
            catch (error) {
                done(error);
            }
        })();
    })
})