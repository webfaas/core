import * as chai from "chai";
import * as mocha from "mocha";
import * as path from "path";

import { Core } from "../lib/Core";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../lib/PackageRegistry/IPackageRegistryResponse";
import { PluginManager } from "../lib/PluginManager/PluginManager";
import { IPlugin } from "../lib/PluginManager/IPlugin";

class CustomPlugin1 implements IPlugin {
    startPlugin(core: Core): Promise<any> {
        return new Promise((resolve, reject)=>{
            resolve();
        });
    }
    
    stopPlugin(core: Core): Promise<any> {
        return new Promise((resolve, reject)=>{
            resolve();
        });
    }
}

function factoryPluginMock_function(){
    return function(){
        return "factoryPluginMock_function";
    }
}

function factoryPluginMock_module(){
}
factoryPluginMock_module.default = function(){
    return function(){
        return "factoryPluginMock_module";
    }
}

describe("Package Registry Routing Plugin", () => {
    it("constructor", function(){
        const core = new Core();
        const pluginManager1 = new PluginManager(core);
        const pluginManager2 = new PluginManager(core, "/tmp");
        const oldMain = process.mainModule;
        process.mainModule = undefined;
        const pluginManager3 = new PluginManager(core);
        process.mainModule = oldMain;
    })

    it("should return properties on call", async function(){
        const core = new Core();
        const pluginManager = new PluginManager(core);
        const customPlugin1 = new CustomPlugin1();

        chai.expect(pluginManager.listPlugin.length).to.eq(0);
        pluginManager.addPlugin(customPlugin1);
        chai.expect(pluginManager.listPlugin.length).to.eq(1);
        await pluginManager.start();
        await pluginManager.stop();

        let plugin1: any = pluginManager.instancePluginBuild(factoryPluginMock_function);
        let plugin2: any = pluginManager.instancePluginBuild(factoryPluginMock_module);
        chai.expect(plugin1()).to.eq("factoryPluginMock_function");
        chai.expect(plugin2()).to.eq("factoryPluginMock_module");
    })

    it("loadplugin", async function(){
        const core = new Core();
        const pluginManager = new PluginManager(core);

        chai.expect(pluginManager.listPlugin.length).to.eq(0);
        pluginManager.loadPluginsByFolder(path.join(__dirname, "mocks", "plugins"));
        chai.expect(pluginManager.listPlugin.length).to.eq(2);
        
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("");
        await pluginManager.start();
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("started");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("started");
        await pluginManager.stop();
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("stoped");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("stoped");
    })
})