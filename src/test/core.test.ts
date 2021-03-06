import * as chai from "chai";
import { Core, LogLevelEnum, ModuleManager } from "../lib/Core";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { Log } from "../lib/Log/Log";
import { Config } from "../lib/Config/Config";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { IMessage } from "../lib/MessageManager/IMessage";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "REGISTRY3", new PackageRegistryMock.PackageRegistry1());
    packageRegistryManager.addRegistry("REGISTRY2", "REGISTRY3", new PackageRegistryMock.PackageRegistry2());
    packageRegistryManager.addRegistry("REGISTRY3", "", new PackageRegistryMock.PackageRegistry3());
}

const log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Core", () => {
    it("constructor - default", function(){
        var core = new Core();
        chai.expect(typeof core.getPackageRegistryManager()).to.eq("object");
        chai.expect(typeof core.getPackageStoreManager()).to.eq("object");
        chai.expect(typeof core.getModuleManager()).to.eq("object");
        chai.expect(typeof core.getMessageManager()).to.eq("object");
        chai.expect(core.getVersion().length).to.gt(4);
        chai.expect(core.getVersionObj().major.length).to.gt(0);
        chai.expect(core.getVersionObj().minor.length).to.gt(0);
        chai.expect(core.getVersionObj().patch.length).to.gt(0);
        chai.expect(typeof(core.getConfig())).to.eq("object");
    })

    it("constructor - full", function(){
        let config = new Config();
        let log = new Log();
        let packageRegistryManager = new PackageRegistryManager(this.log);
        let packageStoreManager = new PackageStoreManager(this.packageRegistryManager, this.log);
        let moduleManager = new ModuleManager(this.packageStoreManager, this.log);
        //let pluginManager = new PluginManager(this);
        
        var core = new Core(config, log, packageRegistryManager, packageStoreManager, moduleManager);
        
        chai.expect(typeof core.getPackageRegistryManager()).to.eq("object");
        chai.expect(typeof core.getPackageStoreManager()).to.eq("object");
        chai.expect(typeof core.getModuleManager()).to.eq("object");
        chai.expect(core.getVersion().length).to.gt(4);
        chai.expect(core.getVersionObj().major.length).to.gt(0);
        chai.expect(core.getVersionObj().minor.length).to.gt(0);
        chai.expect(core.getVersionObj().patch.length).to.gt(0);
        chai.expect(typeof(core.getConfig())).to.eq("object");
    })

    it("sendMessage @registry1/mathmessage version - 0.0.1", async function(){
        var core = new Core(undefined, log);
        loadDefaultRegistries(core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager(), core.getLog())
        
        let msg = {} as IMessage;
        msg.header = {name: "@registry1/mathmessage", version: "0.0.1", method: "sum", messageID: "", tenantID: ""};
        msg.payload = {x:2,y:3}
        let response: any = await core.sendMessage(msg);

        chai.expect(response.payload).to.eq(5);
    })

    it("import @registry1/mathsum version - 0.0.1", async function(){
        var core = new Core(undefined, log);
        loadDefaultRegistries(core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager(), core.getLog())
        
        var response: any = await core.import("@registry1/mathsum", "0.0.1");

        chai.expect(response(2,3)).to.eq(5);
    })
})