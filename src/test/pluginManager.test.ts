import * as chai from "chai";
import * as mocha from "mocha";

import { Core } from "../lib/Core";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../lib/PackageRegistry/IPackageRegistryResponse";
import { PluginManager } from "../lib/PluginManager/PluginManager";
import DefaultPackageRegistryRoutingPlugin from "../lib/Plugins/Registry/DefaultPackageRegistryRoutingPlugin";
import { AbstractPlugin } from "../lib/PluginManager/AbstractPlugin";


class CustomPlugin1 extends AbstractPlugin {
    startPlugin(core: Core): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    stopPlugin(core: Core): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

function factoryPluginMock(){
    // to-do: implement interface IPlugin
    return function(){
        //:IPlugin
    }
}

describe("Package Registry Routing Plugin", () => {
    it("should return properties on call", function(){
        const core = new Core();
        const defaultPackageRegistryRoutingPlugin: DefaultPackageRegistryRoutingPlugin = <DefaultPackageRegistryRoutingPlugin> DefaultPackageRegistryRoutingPlugin.instanceBuilder(core);
        const pluginManager = new PluginManager(core);

        defaultPackageRegistryRoutingPlugin.addRegistryNameByScopeName("webfaaslabs", "GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("webfaaslabs")).to.eq("GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByExternalRouting("@webfaaslabs/mathsum")).to.eq("GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByExternalRouting("mathsum")).to.eq("");
        defaultPackageRegistryRoutingPlugin.addRegistryNameByScopeName("scope1", "route1");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("scope1")).to.eq("route1");
        defaultPackageRegistryRoutingPlugin.removeRegistryNameByScopeName("scope1");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("scope1")).to.eq("");

        pluginManager.instanceBuild(factoryPluginMock);

        chai.expect(() => {CustomPlugin1.instanceBuilder(core)}).to.throw("Override static method");
    })
})