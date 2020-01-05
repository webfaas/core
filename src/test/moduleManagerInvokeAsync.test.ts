import * as chai from "chai";
import * as mocha from "mocha";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("NPM", "", new PackageRegistryNPM(undefined, log));
    //packageRegistryManager.addRegistry("DISK", "", new PackageRegistryDiskTarball(undefined, log));
    //packageRegistryManager.addRegistry("GITHUB", "", new PackageRegistryGitHubTarballV3(undefined, log));
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Module Manager", () => {
    let moduleManager = new ModuleManager(undefined, log);
    loadDefaultRegistries(moduleManager.getPackageStoreManager().getPackageRegistryManager(), log)

    it("invokeAsync @webfaaslabs/mathsum version - 0.0.1", async function(){
        var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3]);

        chai.expect(response).to.eq(5);
    })

    it("invokeAsync @webfaaslabs/mathsum version - 0.0.1 - extra params", async function(){
        var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "0.0.1", "", [2,3,4,5,6]);

        chai.expect(response).to.eq(5);
    })

    it("invokeAsync @webfaaslabs/mathsumasync version - 0.0.2", async function(){
        var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsumasync", "0.0.2", "sum", [{x:2,y:3}]);

        chai.expect(response.result).to.eq(5);
    })

    it("invokeAsync @webfaaslabs/mathsumasync version - 0.0.2 - package.json", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsumasync/package.json", "0.0.2", "");
            chai.expect(response.name).to.eq("@webfaaslabs/mathsumasync");
        }
        catch (error) {
            chai.expect(error).to.null;
        }
    })

    it("invokeAsync uuid/v1 version - 3.3.3", async function(){
        var response: any = await moduleManager.invokeAsync("uuid/v1", "3.3.3");

        chai.expect(typeof(response)).to.eq("string");
    })

    it("invokeAsync moment version - 2.24.0", async function(){
        var response: any = await moduleManager.invokeAsync("moment", "2.24.0", "", ["20190101", "YYYYMMDD"]);

        chai.expect(response.calendar()).to.eq("01/01/2019");
    })

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.1", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.1", "", []);
            chai.expect(response.result).to.eq(50000);
        }
        catch (error) {
            //Error: simulate error
            chai.expect(error instanceof WebFaasError.InvokeError).to.eq(true);
        }
    })

    it("invokeAsync @webfaaslabs/mathsum version - version 99.0.0", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "99.0.0", "", [2,3]);
            chai.expect(response.result).to.eq(50000);
        }
        catch (error) {
            chai.expect(error).to.not.null;
        }
    })

    it("invokeAsync @webfaaslabs/mathsum version - version 99.*", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/mathsum", "99.*", "", [2,3]);
            chai.expect(response.result).to.eq(50000);
        }
        catch (error) {
            chai.expect(error instanceof WebFaasError.NotFoundError).to.eq(true);
        }
    })
})

describe("Module Manager - internal require", () => {
    let moduleManager = new ModuleManager(undefined, log);
    loadDefaultRegistries(moduleManager.getPackageStoreManager().getPackageRegistryManager(), log)

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.3 - lib1", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["lib1"], "", false);
            chai.expect(true).to.eq(true);
        } catch (error) {
            chai.expect(error).to.null;
        }
    })

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.3 - file1", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["file1"], "", false);
            chai.expect(true).to.eq(true);
        } catch (error) {
            chai.expect(error).to.null;
        }
    })

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.3 - lib2 - error compile", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["lib2"], "", false);
            chai.expect(response).to.eq(50000);
        } catch (error) {
            chai.expect(error instanceof WebFaasError.InvokeError).to.eq(true);
        }
    })

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.3 - file2 - error compile", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["file2"], "", false);
            chai.expect(response).to.eq(50000);
        } catch (error) {
            chai.expect(error instanceof WebFaasError.InvokeError).to.eq(true);
        }
    })
})

describe("Module Manager - disable imediateCleanMemoryCacheModuleFiles and clean cache", () => {
    let moduleManager = new ModuleManager(undefined, log);
    loadDefaultRegistries(moduleManager.getPackageStoreManager().getPackageRegistryManager(), log)

    it("invokeAsync @webfaaslabs/simulateerror version - 0.0.3 - lib1", async function(){
        try {
            var response: any = await moduleManager.invokeAsync("@webfaaslabs/simulateerror", "0.0.3", "", ["lib1"], "", false);
            chai.expect(true).to.eq(true);
        } catch (error) {
            chai.expect(error).to.null;
        }

        moduleManager.cleanMemoryCacheModuleFiles("@webfaaslabs/simulateerror", "0.0.3");
    })
})