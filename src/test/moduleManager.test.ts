import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Module Manager", () => {
    it("constructor", function(done){
        let moduleManager1 = new ModuleManager();
        chai.expect(typeof(moduleManager1.getPackageStoreManager())).to.eq("object");

        let packageStoreManager2 = new PackageStoreManager();
        let moduleManager2 = new ModuleManager(packageStoreManager2);
        chai.expect(moduleManager2.getPackageStoreManager()).to.eq(packageStoreManager2);

        done();
    })

    it("import uuid/v1 version - 3", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
            
        let responseObj1: any = await moduleManager1.import("uuid/v1", "3");
        chai.expect(typeof(responseObj1())).to.eq("string");

        //force return in cache
        let responseObj2: any = await moduleManager1.import("uuid/v1", "3");
        chai.expect(typeof(responseObj2())).to.eq("string");

        //notexist
        let responseObj3: any = await moduleManager1.import("uuid/notexist", "3");
        chai.expect(responseObj3).to.null;
    })

    it("import uuid/v1 version - 3.3.3", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
            
        let responseObj1: any = await moduleManager1.import("uuid/v1", "3.3.3");
        chai.expect(typeof(responseObj1())).to.eq("string");

        //force return in cache
        let responseObj2: any = await moduleManager1.import("uuid/v1", "3.3.3");
        chai.expect(typeof(responseObj2())).to.eq("string");

        //notexist
        let responseObj3: any = await moduleManager1.import("uuid/notexist", "3.3.3");
        chai.expect(responseObj3).to.null;
    })

    it("import chalk version - 3", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
            
        let responseObj1: any = await moduleManager1.import("chalk", "3");
        chai.expect(typeof(responseObj1.Level)).to.eq("object");

        //force return in cache
        let responseObj2: any = await moduleManager1.import("chalk", "3");
        chai.expect(typeof(responseObj2.Level)).to.eq("object");

        //notexist
        let responseObj3: any = await moduleManager1.import("chalk/notexist", "3");
        chai.expect(responseObj3).to.null;
    })

    it("import chalk version - 3.0.0", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);
            
        let responseObj1: any = await moduleManager1.import("chalk", "3.0.0");
        chai.expect(typeof(responseObj1.Level)).to.eq("object");

        //force return in cache
        let responseObj2: any = await moduleManager1.import("chalk", "3.0.0");
        chai.expect(typeof(responseObj2.Level)).to.eq("object");

        //notexist
        let responseObj3: any = await moduleManager1.import("chalk/notexist", "3.0.0");
        chai.expect(responseObj3).to.null;
    })

    it("import package not exist", async function(){
        let moduleManager1 = new ModuleManager(undefined, log);

        try {
            let responseObj1: any = await moduleManager1.import("packagenotexist_packagenotexist/v1", "3");
            chai.expect(responseObj1).to.null;
        }
        catch (errTry) {
            chai.expect(errTry).to.be.an.instanceOf(WebFaasError.NotFoundError);
            chai.expect((<WebFaasError.NotFoundError> errTry).type).to.eq(WebFaasError.NotFoundErrorTypeEnum.MANIFEST);
        }
    })
})

/*
describe("Module Manager", () => {
    var packageRegistryManager_withoutconfigregistries: PackageRegistryManager  = new PackageRegistryManager(log);
    var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_disabled: PackageRegistryManager = new PackageRegistryManager(log);
    var packageRegistryManager_error: PackageRegistryManager = new PackageRegistryManager(log);
    
    packageRegistryManager_default.loadDefaultRegistries();
    packageRegistryManager_default.addRouteByScope("webfaaslabs", "GITHUB");
    packageRegistryManager_disabled.loadDefaultRegistries();
    packageRegistryManager_error.addRegistry("registry_disabled", new PackageRegistryError(), PackageRegistryManagerItemStatusEnum.DISABLED); //not default registry when disabled
    packageRegistryManager_error.addRegistry("registry1", new PackageRegistryError());

    chai.expect(packageRegistryManager_default.getDefaultRegistryName()).to.eq("NPM");
    chai.expect(packageRegistryManager_default.getRouteByScope("webfaaslabs")).to.eq("GITHUB");
    chai.expect(packageRegistryManager_default.getRegistry("notfound")).to.be.null;
    packageRegistryManager_default.addRouteByScope("scope1", "route1");
    chai.expect(packageRegistryManager_default.getRouteByScope("scope1")).to.eq("route1");
    packageRegistryManager_default.removeRouteByScope("scope1");
    chai.expect(packageRegistryManager_default.getRouteByScope("scope1")).to.eq("");
    chai.expect(packageRegistryManager_default.getRegistry(PackageRegistryManagerRegistryTypeEnum.NPM.toString())).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry(PackageRegistryManagerRegistryTypeEnum.DISK.toString())).to.be.not.null;
    chai.expect(packageRegistryManager_default.getRegistry(PackageRegistryManagerRegistryTypeEnum.GITHUB.toString())).to.be.not.null;

    chai.expect(packageRegistryManager_disabled.getDefaultRegistryName()).to.eq("NPM");
    chai.expect(packageRegistryManager_disabled.getRegistry("notfound")).to.be.null;
    packageRegistryManager_disabled.addRouteByScope("scope1", "route1");
    chai.expect(packageRegistryManager_disabled.getRouteByScope("scope1")).to.eq("route1");
    packageRegistryManager_disabled.removeRouteByScope("scope1");
    chai.expect(packageRegistryManager_disabled.getRouteByScope("scope1")).to.eq("");
    chai.expect(packageRegistryManager_disabled.getRegistry(PackageRegistryManagerRegistryTypeEnum.NPM.toString())).to.be.not.null;
    chai.expect(packageRegistryManager_disabled.getRegistry(PackageRegistryManagerRegistryTypeEnum.DISK.toString())).to.be.not.null;
    chai.expect(packageRegistryManager_disabled.getRegistry(PackageRegistryManagerRegistryTypeEnum.GITHUB.toString())).to.be.not.null;

    chai.expect(packageRegistryManager_error.getDefaultRegistryName()).to.eq("registry1");
    chai.expect(packageRegistryManager_error.getRegistry("notfound")).to.be.null;
    chai.expect(packageRegistryManager_error.getRegistry("registry1")).to.be.not.null;
    packageRegistryManager_error.addRouteByScope("scope1", "route1");
    chai.expect(packageRegistryManager_error.getRouteByScope("scope1")).to.eq("route1");
    packageRegistryManager_error.removeRouteByScope("scope1");
    chai.expect(packageRegistryManager_error.getRouteByScope("scope1")).to.eq("");
    packageRegistryManager_error.setDefaultRegistryName("notfound");
    chai.expect(packageRegistryManager_error.getDefaultRegistryName()).to.eq("registry1");
    

    //disable all registry
    let tmpItem: PackageRegistryManagerItem | null;
    tmpItem = packageRegistryManager_disabled.getRegistryItem(PackageRegistryManagerRegistryTypeEnum.NPM.toString());
    if (tmpItem) tmpItem.status = PackageRegistryManagerItemStatusEnum.DISABLED;
    tmpItem = packageRegistryManager_disabled.getRegistryItem(PackageRegistryManagerRegistryTypeEnum.DISK.toString());
    if (tmpItem) tmpItem.status = PackageRegistryManagerItemStatusEnum.DISABLED;
    tmpItem = packageRegistryManager_disabled.getRegistryItem(PackageRegistryManagerRegistryTypeEnum.GITHUB.toString());
    if (tmpItem) tmpItem.status = PackageRegistryManagerItemStatusEnum.DISABLED;

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
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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
                    chai.expect(fileBuffer.toString().indexOf("return x + y;") > 0).to.eq(true);
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
                    chai.expect(fileBuffer.toString().indexOf("return x + y;") > 0).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return error - loadDefaultRegistries", function(done){
        packageRegistryManager_disabled.getPackageStore("semver", "5.6.0").then(function(packageStore){
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

    it("should return error - custom Registry", function(done){
        packageRegistryManager_error.getPackageStore("semver", "5.6.0").then(function(packageStore){
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
*/