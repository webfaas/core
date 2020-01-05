import * as chai from "chai";
import * as mocha from "mocha";

import { Core } from "../lib/Core";
import { DefaultPackageRegistryRoutingPlugin } from "../lib/Plugins/DefaultPackageRegistryRoutingPlugin";
import { IPackageRegistry } from "../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../lib/PackageRegistry/IPackageRegistryResponse";

describe("Package Registry Routing Plugin", () => {
    it("should return properties on call", function(){
        const core = new Core();
        const defaultPackageRegistryRoutingPlugin = new DefaultPackageRegistryRoutingPlugin(core);

        defaultPackageRegistryRoutingPlugin.addRegistryNameByScopeName("webfaaslabs", "GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("webfaaslabs")).to.eq("GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByExternalRouting("@webfaaslabs/mathsum")).to.eq("GITHUB");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByExternalRouting("mathsum")).to.eq("");
        defaultPackageRegistryRoutingPlugin.addRegistryNameByScopeName("scope1", "route1");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("scope1")).to.eq("route1");
        defaultPackageRegistryRoutingPlugin.removeRegistryNameByScopeName("scope1");
        chai.expect(defaultPackageRegistryRoutingPlugin.getRegistryNameByScopeName("scope1")).to.eq("");
    })
})