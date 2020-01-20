import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Module Manager - Invoke Async", () => {
    let moduleManager = new ModuleManager(undefined, log);
    loadDefaultRegistries(moduleManager.getPackageStoreManager().getPackageRegistryManager(), log)

    it("invokeAsync @registry1/mathsum version - 0.0.1", async function(){
        var response: any = await moduleManager.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);

        chai.expect(response).to.eq(5);
    })

    it("invokeAsync @registry1/mathsum version - 0.0.1 - extra params", async function(){
        var response: any = await moduleManager.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3,4,5,6]);

        chai.expect(response).to.eq(5);
    })

    it("invokeAsync @registry1/mathsumasync version - 1.0.0", async function(){
        var response: any = await moduleManager.invokeAsync("@registry1/mathsumasync", "1.0.0", "sum", [{x:2,y:3}]);
        chai.expect(response.result).to.eq(5);
        //force cache
        var response2: any = await moduleManager.invokeAsync("@registry1/mathsumasync", "1.0.0", "sum", [{x:2,y:3}]);
        chai.expect(response2.result).to.eq(5);
    })

    it("invokeAsync @registry1/mathsumasync version - 2.0.0", async function(){
        var response: any = await moduleManager.invokeAsync("@registry1/mathsumasync", "2.0.0", "sum", [{x:2,y:3}]);
        chai.expect(response.result).to.eq(5);
        //force cache
        var response2: any = await moduleManager.invokeAsync("@registry1/mathsumasync", "2.0.0", "sum", [{x:2,y:3}]);
        chai.expect(response2.result).to.eq(5);
    })

    it("invokeAsync @registry1/mathsumasync version - 1.0.0 - package.json", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@registry1/mathsumasync/package.json", "1.0.0", "");
            chai.expect(response.name).to.eq("@registry1/mathsumasync");
        }
        catch (error) {
            chai.expect(error).to.null;
        }
    })

    it("invokeAsync @registry1/mathsum version - version 99.0.0", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@registry1/mathsum", "99.0.0", "", [2,3]);
            chai.expect(response.result).to.eq(50000);
        }
        catch (error) {
            chai.expect(error).to.not.null;
        }
    })

    it("invokeAsync @registry1/mathsum version - version 99.*", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@registry1/mathsum", "99.*", "", [2,3]);
            chai.expect(response.result).to.eq(50000);
        }
        catch (error) {
            chai.expect(error instanceof WebFaasError.NotFoundError).to.eq(true);
        }
    })

    it("invokeAsync @registry1/syntaxerror - 0.0.1", async function(){
        try {
            let responseObj1: any = await moduleManager.invokeAsync("@registry1/syntaxerror", "0.0.1");
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("CompileError");
        }
    })

    it("invokeAsync @registry1/executionerror - 0.0.1", async function(){
        try {
            let responseObj1: any = await moduleManager.invokeAsync("@registry1/executionerror", "0.0.1");
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("execution error");
        }
    })
})

describe("Module Manager - InvokeAsync - disable imediateCleanMemoryCacheModuleFiles and clean cache", () => {
    let moduleManager = new ModuleManager(undefined, log);
    loadDefaultRegistries(moduleManager.getPackageStoreManager().getPackageRegistryManager(), log)

    it("invokeAsync @registry1/mathsum version - 0.0.1", async function(){
        var response: any = await moduleManager.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3], "", false);

        chai.expect(response).to.eq(5);

        moduleManager.cleanMemoryCacheModuleFiles("@registry1/simulateerror", "0.0.3");
    })

    it("invokeAsync @registry1/syntaxerror - 0.0.1", async function(){
        try {
            let responseObj1: any = await moduleManager.invokeAsync("@registry1/syntaxerror", "0.0.1", "", undefined, "", false);
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.name).to.eq("CompileError");
        }
    })

    it("invokeAsync @registry1/executionerror - 0.0.1", async function(){
        try {
            let responseObj1: any = await moduleManager.invokeAsync("@registry1/executionerror", "0.0.1", "", undefined, "", false);
            throw new Error("Sucess!");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("execution error");
        }
    })
})