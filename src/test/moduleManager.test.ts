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