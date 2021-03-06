import * as chai from "chai";
import * as mocha from "mocha";

import {Config} from "../lib/Config/Config";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

process.env.VAR1 = "1";
process.env.VAR2 = "2";

describe("Config - Custom Config", () => {
    let configData: any = {};
    configData.attribute1 = "value1";
    configData.attribute2 = "value2";
    configData.attribute3 = null;
    configData.attribute4 = undefined;
    let config = new Config(log);
    config.read(configData);
    
    it("should return response on call", () => {
        chai.expect(config.get("attribute1")).to.eq("value1");
        chai.expect(config.get("attribute2")).to.eq("value2");
        chai.expect(config.get("attribute3")).to.null;
        chai.expect(config.get("attribute4")).to.null;
    })
})

describe("Config - Empty", () => {
    let config = new Config(log);
    config.read(null);
    
    it("should return response on call", () => {
        chai.expect(config.get("attribute1")).to.null;
        chai.expect(config.get("attribute2")).to.null;
    })
})

describe("Config - NotFound", () => {
    let tempFolder = path.join(os.tmpdir(), "webfaas-core-config-notfound-" + new Date().getTime());
    
    it("should return response on call", () => {
        let config = new Config(log);
        chai.expect(config.read(path.join(tempFolder, "file1"))).to.not.throw;
    })
})

describe("Config - Denied", () => {
    let tempFolder = path.join(os.tmpdir(), "webfaas-core-config-denied-000-" + new Date().getTime());
    fs.mkdirSync(tempFolder);
    fs.chmodSync(tempFolder, "000");

    it("should return response on call", () => {
        let config = new Config(log);
        chai.expect(config.read(path.join(tempFolder, "file1"))).to.not.throw;
    })
})

describe("Config - Default Config", () => {
    let config = new Config(log);
    config.read(path.join(__dirname, "./data/data-config/default.json"));
    
    it("should return response on call", () => {
        chai.expect(config.get("core.log.level")).to.eq("INFO");
        chai.expect(config.get("core.cache.blackListLocalModules")).to.eql(["functions-io-core", "functions-io"]);
        chai.expect(config.get("registry.requestTimeout")).to.eq(5000);
        chai.expect(config.get("registry.security.client.token")).to.eq("HHH");
        chai.expect(config.get("registry.listRemoteRegistry.default.master")).to.eq("https://registry.npmjs.org");
        chai.expect(config.get("env.var1")).to.eq("1");
        chai.expect(config.get("env.var2")).to.eq("2");
        chai.expect(config.get("env.varmultiple")).to.eq("TEST 1 TEST 1 TEST 2 TEST 2 TEST 3");
    })
})

describe("Config - Declared Config", () => {
    let config = new Config(log);
    config.read(path.join(__dirname, "./data/data-config", "config2.json"));
    
    it("should return response on call", () => {
        chai.expect(config.get("core.log.level")).to.eq("INFO");
        chai.expect(config.get("core.cache.blackListLocalModules")).to.eql(["functions-io-core", "functions-io"]);
        chai.expect(config.get("env2.var1")).to.eq("1");
        chai.expect(config.get("env2.var2")).to.eq("2");
        chai.expect(config.get("env2.varmultiple")).to.eq("TEST 1 TEST 1 TEST 2 TEST 2 TEST 3");
    })
})