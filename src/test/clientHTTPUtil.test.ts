import * as fs from "fs";
import * as path from "path";
import * as chai from "chai";
import * as mocha from "mocha";
import { IModuleNameData, ModuleNameUtil } from "../lib/Util/ModuleNameUtil";
import { ClientHTTPUtil } from "../lib/Util/ClientHTTPUtil";
import { ClientHTTPConfig } from "../lib/Core";

describe("ClientHTTPUtil", () => {
    const defaulClientHTTPConfig = new ClientHTTPConfig();
    const filePathCert = path.join(__dirname, "./data/crt/cert.pem");
    const fileBufferCert = fs.readFileSync(filePathCert);
    
    it("parsePathName", () => {
        chai.expect(ClientHTTPUtil.parsePathName("/foder1/test1")).to.eq("/foder1/test1");
        chai.expect(ClientHTTPUtil.parsePathName("./foder1/test1")).to.eq(path.join(process.cwd(), "./foder1/test1"));
    })

    it("default values", () => {
        let resp_default  = ClientHTTPUtil.parseClientHTTPConfig({});
        chai.expect(resp_default.timeout).to.eq(defaulClientHTTPConfig.timeout);
        chai.expect(resp_default.rejectUnauthorized).to.eq(defaulClientHTTPConfig.rejectUnauthorized);
        chai.expect(resp_default.maxSockets).to.eq(defaulClientHTTPConfig.maxSockets);
        chai.expect(resp_default.keepAlive).to.eq(defaulClientHTTPConfig.keepAlive);
        chai.expect(resp_default.pfx).to.eq(defaulClientHTTPConfig.pfx);
        chai.expect(resp_default.key).to.eq(defaulClientHTTPConfig.key);
        chai.expect(resp_default.cert).to.eq(defaulClientHTTPConfig.cert);
        chai.expect(resp_default.ca).to.eq(defaulClientHTTPConfig.ca);
    })

    it("change values", () => {
        let item: any = {};

        item.timeout = 3;
        item.rejectUnauthorized = "false";
        item.maxSockets = 4;
        item.keepAlive = "false";
        item.pfx = filePathCert;
        item.key = filePathCert;
        item.cert = filePathCert;
        item.ca = filePathCert;

        let resp1  = ClientHTTPUtil.parseClientHTTPConfig(item);
        chai.expect(resp1.timeout).to.eq(3);
        chai.expect(resp1.rejectUnauthorized).to.eq(false);
        chai.expect(resp1.maxSockets).to.eq(4);
        chai.expect(resp1.keepAlive).to.eq(false);
        chai.expect(resp1.pfx?.toString()).to.eq(fileBufferCert.toString());
        chai.expect(resp1.key?.toString()).to.eq(fileBufferCert.toString());
        chai.expect(resp1.cert?.toString()).to.eq(fileBufferCert.toString());
        chai.expect(resp1.ca?.toString()).to.eq(fileBufferCert.toString());
    })
})