import * as chai from "chai";

import { ModuleManager } from "../lib/ModuleManager/ModuleManager";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { PackageStoreManager } from "../lib/PackageStoreManager/PackageStoreManager";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";
import { MessageManager } from "../lib/MessageManager/MessageManager";
import { Config } from "../lib/Config/Config";
import { MessageManagerTenant } from "../lib/MessageManager/MessageManagerTenant";

function loadDefaultRegistries(packageRegistryManager: PackageRegistryManager, log: Log){
    packageRegistryManager.addRegistry("REGISTRY1", "", new PackageRegistryMock.PackageRegistry1());
}

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

var packageRegistryManager_default: PackageRegistryManager = new PackageRegistryManager(log);
loadDefaultRegistries(packageRegistryManager_default, log);
var packageStoreManager_default = new PackageStoreManager(packageRegistryManager_default, log);

describe("Message Manager - Connection", () => {
    it("http - tenant01", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let configTenant = new Config();
        let configObj = {} as any;
        configObj.http = {};
        configObj.http.maxSockets = 5;
        configObj.http.timeout = 10;
        configTenant.read(configObj)
        messageManager.addTenant("tenant01", new MessageManagerTenant("tenant01", configTenant, log));
        
        let tenant = messageManager.getTenant("tenant01");

        let cn_http = tenant.invokeContext.getConnection("http");
        chai.expect(cn_http).to.not.null;
        if (cn_http){
            chai.expect(typeof(cn_http)).to.eq("object");
            chai.expect(cn_http.getTenantID()).to.eq("tenant01");
        }

        let cn_http2 = tenant.invokeContext.getConnection("http"); //force cache
        chai.expect(cn_http2).to.not.null;
        if (cn_http2){
            chai.expect(typeof(cn_http2)).to.eq("object");
            chai.expect(cn_http.getTenantID()).to.eq("tenant01");
        }

        let cn_notexist = tenant.invokeContext.getConnection("notexist");
        chai.expect(cn_notexist).to.null;

        tenant.stop();
    })

    it("http default tenant", async function(){
        let moduleManager = new ModuleManager(packageStoreManager_default, log);
        let messageManager = new MessageManager(moduleManager, log);

        let tenant = messageManager.getTenant("");

        let cn_http = tenant.invokeContext.getConnection("http");
        chai.expect(cn_http).to.not.null;
        if (cn_http){
            chai.expect(typeof(cn_http)).to.eq("object");
            chai.expect(cn_http.getTenantID()).to.eq("default");
        }

        tenant.stop();
    })
})