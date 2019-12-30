import * as chai from "chai";
import * as mocha from "mocha";

import { WebFaasError } from "../lib/WebFaasError/WebFaasError";

describe("WebFaasError", () => {
    //
    //NotFoundError
    //
    it("NotFoundError - should return property", function(){
        var error1 = new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.DEPENDENCY, "file1");

        chai.expect(error1.name).to.eq("NotFoundError");
        chai.expect(error1.message).to.eq(error1.type.toString() + " NOT FOUND");
        chai.expect(error1.artefactName).to.eq("file1");
    })

    //
    //ClientHttpError
    //
    it("ClientHttpError - complete - should return property", function(){
        var error1 = new WebFaasError.ClientHttpError(new Error("message1"), "url1", "GET");

        chai.expect(error1.name).to.eq("ClientHttpError");
        chai.expect(error1.message).to.eq("message1");
        chai.expect(error1.code).to.eq("");
        chai.expect(error1.url).to.eq("url1");
        chai.expect(error1.method).to.eq("GET");
    })

    it("ClientHttpError - icomplete - should return property", function(){
        var error1 = new WebFaasError.ClientHttpError({code:"CODE1"}, "url1", "GET");
        chai.expect(error1.name).to.eq("ClientHttpError");
        chai.expect(error1.message).to.eq("");
        chai.expect(error1.code).to.eq("CODE1");
        chai.expect(error1.url).to.eq("url1");
        chai.expect(error1.method).to.eq("GET");

        var error2 = new WebFaasError.ClientHttpError({}, "url1");
        chai.expect(error2.method).to.eq("GET");
        chai.expect(error2.code).to.eq("");
    })

    //
    //CompileError
    //
    it("CompileError - complete - should return property", function(){
        var error1 = new WebFaasError.CompileError(new Error("message1"));

        chai.expect(error1.name).to.eq("CompileError");
        chai.expect(error1.message).to.eq("message1");
        chai.expect(error1.code).to.eq("");
    })

    it("CompileError - icomplete - should return property", function(){
        var error1 = new WebFaasError.CompileError({code:"CODE1"});
        chai.expect(error1.name).to.eq("CompileError");
        chai.expect(error1.message).to.eq("");
        chai.expect(error1.code).to.eq("CODE1");
    })

    //
    //FileError
    //
    it("FileError - complete - should return property", function(){
        var error1 = new WebFaasError.FileError(new Error("message1"));

        chai.expect(error1.name).to.eq("FileError");
        chai.expect(error1.message).to.eq("message1");
        chai.expect(error1.code).to.eq("");
    })

    it("FileError - icomplete - should return property", function(){
        var error1 = new WebFaasError.FileError({code:"CODE1"});
        chai.expect(error1.name).to.eq("FileError");
        chai.expect(error1.message).to.eq("");
        chai.expect(error1.code).to.eq("CODE1");
    })
})