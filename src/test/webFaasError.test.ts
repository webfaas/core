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
        chai.expect(error1.url).to.eq("url1");
        chai.expect(error1.method).to.eq("GET");
    })

    it("ClientHttpError - icomplete - should return property", function(){
        var error1 = new WebFaasError.ClientHttpError(new Error(), "url1");
        chai.expect(error1.name).to.eq("ClientHttpError");
        chai.expect(error1.message).to.eq("");
        chai.expect(error1.url).to.eq("url1");
        chai.expect(error1.method).to.eq("GET");
    })

    //
    //CompileError
    //
    it("CompileError - complete - should return property", function(){
        var error1 = new WebFaasError.CompileError(new Error("message1"));

        chai.expect(error1.name).to.eq("CompileError");
        chai.expect(error1.message).to.eq("message1");
    })

    //
    //FileError
    //
    it("FileError - complete - should return property", function(){
        var error1 = new WebFaasError.FileError(new Error("message1"));

        chai.expect(error1.name).to.eq("FileError");
        chai.expect(error1.message).to.eq("message1");
    })

    //
    //InvokeError
    //
    it("InvokeError - complete - should return property", function(){
        var error1 = new WebFaasError.InvokeError(new Error("message1"));

        chai.expect(error1.name).to.eq("InvokeError");
        chai.expect(error1.message).to.eq("message1");
    })

    //
    //SecurityError
    //
    it("SecurityError - complete - should return property", function(){
        var error1 = new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "message1");

        chai.expect(error1.name).to.eq("SecurityError");
        chai.expect(error1.type).to.eq(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED);
        chai.expect(error1.message).to.eq("message1");
    })

    //
    //ValidateError
    //
    it("ValidateError - complete - should return property", function(){
        var error1 = new WebFaasError.ValidateError("001", "field1", "message1");

        chai.expect(error1.name).to.eq("ValidateError");
        chai.expect(error1.message).to.eq("message1");
        chai.expect(error1.code).to.eq("001");
        chai.expect(error1.field).to.eq("field1");
    })
})