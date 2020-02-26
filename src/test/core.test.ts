import * as chai from "chai";
import { Core } from "../lib/Core";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { Log } from "../lib/Log/Log";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

describe("Core", () => {
    it("constructor - default", function(){
        var core = new Core();
        chai.expect(typeof core.getModuleManager()).to.eq("object");
        chai.expect(typeof core.getPluginManager()).to.eq("object");
        chai.expect(core.getVersion().length).to.gt(4);
        chai.expect(typeof(core.getConfig())).to.eq("object");
    })

    it("start", async function(){
        var core = new Core();
        await core.start();
        chai.expect(typeof(core.getModuleManager())).to.eq("object");
    })

    it("stop", async function(){
        var core = new Core();
        await core.stop();
        chai.expect(typeof(core.getModuleManager())).to.eq("object");
    })

    it("invokeAsync @registry1/mathsum version - 0.0.1", async function(){
        var core = new Core();
        loadDefaultRegistries(core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager(), core.getLog())
        
        await core.start();
        var response: any = await core.invokeAsync("@registry1/mathsum", "0.0.1", "", [2,3]);

        chai.expect(response).to.eq(5);
    })

    it("import @registry1/mathsum version - 0.0.1", async function(){
        var core = new Core();
        loadDefaultRegistries(core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager(), core.getLog())
        
        await core.start();
        var response: any = await core.import("@registry1/mathsum", "0.0.1");

        chai.expect(response(2,3)).to.eq(5);
    })
})