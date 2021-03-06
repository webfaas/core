import * as chai from "chai";
import * as path from "path";

import { Core, Log, LogLevelEnum } from "../lib/Core";
import { PluginManager } from "../lib/PluginManager/PluginManager";
import { IPlugin } from "../lib/PluginManager/IPlugin";

const log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

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
        const core = new Core(undefined, log);
        
        const pluginManager1 = new PluginManager(core);
    })

    it("should return properties on call", async function(){
        const core = new Core(undefined, log);
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
        const core = new Core(undefined, log);
        const pluginManager = new PluginManager(core);
        
        chai.expect(pluginManager.listPlugin.length).to.eq(0);
        pluginManager.loadPluginsByFolder(path.join(__dirname, "mocks", "plugins"));
        chai.expect(pluginManager.listPlugin.length).to.eq(4);
        
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("");
        chai.expect((<any> pluginManager.listPlugin[2]).state).to.eq("");
        chai.expect((<any> pluginManager.listPlugin[3]).state).to.eq("");
        await pluginManager.start();
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("started");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("started");
        chai.expect((<any> pluginManager.listPlugin[2]).state).to.eq("started");
        chai.expect((<any> pluginManager.listPlugin[3]).state).to.eq("started");
        await pluginManager.stop();
        chai.expect((<any> pluginManager.listPlugin[0]).state).to.eq("stoped");
        chai.expect((<any> pluginManager.listPlugin[1]).state).to.eq("stoped");
        chai.expect((<any> pluginManager.listPlugin[2]).state).to.eq("stoped");
        chai.expect((<any> pluginManager.listPlugin[3]).state).to.eq("stoped");
    })

    it("loadplugin - simulate error", async function(){
        const core = new Core(undefined, log);
        const pluginManager = new PluginManager(core);
        
        try {
            pluginManager.loadPluginsByFolder(path.join(__dirname, "mocks", "pluginserror"));    
            throw new Error("Success");
        }
        catch (errTry) {
            chai.expect(errTry.message).to.eq("internal plugin error");
        }
    })

    it("loadplugin - not found", async function(){
        const core = new Core(undefined, log);
        const pluginManager = new PluginManager(core);

        chai.expect(pluginManager.listPlugin.length).to.eq(0);
        pluginManager.loadPluginsByFolder("/tmp/webfaas__plugin_notfound__");
        chai.expect(pluginManager.listPlugin.length).to.eq(0);
    })
})