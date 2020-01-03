import * as chai from "chai";
import * as mocha from "mocha";

import { InvokeData } from "../lib/ModuleManager/InvokeData";

describe("InvokeData", () => {
    it("should return property - complete - scope", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("@scope/module1:version1#method1");
        chai.expect(invokeData1.name).to.eq("@scope/module1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("method1");
    })

    it("should return property - complete - scope - submodule", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("@scope/module1/submodule1:version1#method1");
        chai.expect(invokeData1.name).to.eq("@scope/module1/submodule1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("method1");
    })

    it("should return property - complete", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("module1:version1#method1");
        chai.expect(invokeData1.name).to.eq("module1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("method1");
    })

    it("should return property - complete - submodule", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("module1/submodule1:version1#method1");
        chai.expect(invokeData1.name).to.eq("module1/submodule1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("method1");
    })

    it("should return property - without version - scope", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("@scope/module1#method1");
        chai.expect(invokeData1.name).to.eq("@scope/module1");
        chai.expect(invokeData1.version).to.eq("*");
        chai.expect(invokeData1.method).to.eq("method1");
    })
    
    it("should return property - without version", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("module1#method1");
        chai.expect(invokeData1.name).to.eq("module1");
        chai.expect(invokeData1.version).to.eq("*");
        chai.expect(invokeData1.method).to.eq("method1");
    })

    it("should return property - without version - method", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("@scope/module1:version1");
        chai.expect(invokeData1.name).to.eq("@scope/module1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("");
    })
    
    it("should return property - without method", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("module1:version1");
        chai.expect(invokeData1.name).to.eq("module1");
        chai.expect(invokeData1.version).to.eq("version1");
        chai.expect(invokeData1.method).to.eq("");
    })

    it("should return property - without scope and version - method", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("@scope/module1");
        chai.expect(invokeData1.name).to.eq("@scope/module1");
        chai.expect(invokeData1.version).to.eq("*");
        chai.expect(invokeData1.method).to.eq("");
    })
    
    it("should return property - without scope and method", function(){
        var invokeData1 = InvokeData.parseInvokeCommandTexto("module1");
        chai.expect(invokeData1.name).to.eq("module1");
        chai.expect(invokeData1.version).to.eq("*");
        chai.expect(invokeData1.method).to.eq("");
    })
})