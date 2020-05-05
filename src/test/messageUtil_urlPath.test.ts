import * as chai from "chai";
import { MessageUtil } from "../lib/Util/MessageUtil";
import { WebFaasError } from "../lib/Core";

describe("MessageUtil - UrlPath", () => {
    //
    //URL BASE
    //
    it("urlPath - base1/module1/version1 | urlBase - base1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("base1/module1/version1", "base1", null, "", null);
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })
    it("urlPath - base1/module1/version1 | urlBase - /base1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("base1/module1/version1", "/base1", null, "", null);
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })
    it("urlPath - base1/module1/version1/path1 | urlBase - /base1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("base1/module1/version1/path1", "/base1", null, "", null);
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("/path1");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    //
    //WHITOUT SCOPE
    //
    it("urlPath - module1/version1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1/version1", "", null, "", null);
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - /module1/version1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("/module1/version1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - module1:method1/version1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1:method1/version1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - module1:method1/version1/path1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1:method1/version1/path1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("/path1");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - module1:method1/version1/path1/subpath2", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1:method1/version1/path1/subpath2", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("/path1/subpath2");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    //
    //WITH SCOPE
    //
    it("urlPath - @scope1/module1/version1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("@scope1/module1/version1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("@scope1/module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })
    
    it("urlPath - @scope1/module1:method1/version1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("@scope1/module1:method1/version1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("@scope1/module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - @scope1/module1:method1/version1/path1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("@scope1/module1:method1/version1/path1", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("@scope1/module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("/path1");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("urlPath - @scope1/module1:method1/version1/path1/subpath2", function(){
        let msg = MessageUtil.parseMessageByUrlPath("@scope1/module1:method1/version1/path1/subpath2", "", null, "", null);
        let header = msg?.header;

        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("@scope1/module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("method1");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.null;
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("/path1/subpath2");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("Authorization - empty", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1/version1", "", null, "", {"Authorization": ""});
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.not.null;
        chai.expect(header?.http?.headers["Authorization"]).to.eq("");
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("Authorization - Bearer", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1/version1", "", null, "", {"Authorization": "Bearer"});
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.not.null;
        chai.expect(header?.http?.headers["Authorization"]).to.eq("Bearer");
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("parseModuleheader - Bearer AAA", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1/version1", "", null, "", {"Authorization": "Bearer AAA"});
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.not.null;
        chai.expect(header?.http?.headers["Authorization"]).to.eq("Bearer AAA");
        chai.expect(header?.http?.method).to.eq("GET");
        chai.expect(header?.http?.path).to.eq("");
        chai.expect(header?.identity).to.undefined;
        
        chai.expect(header?.authorization).to.not.undefined;
        chai.expect(header?.authorization?.type).to.eq("bearer");
        chai.expect(header?.authorization?.token).to.eq("AAA");
    })

    //
    //convertCodeErrorToHttp
    //

    it("convertCodeErrorToHttp - ClientHttpError", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.ClientHttpError(new Error("err1"), "url1", "method1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(502);
    })

    it("convertCodeErrorToHttp - ValidateError", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.ValidateError("001", "field1", "message1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(400);
    })

    it("convertCodeErrorToHttp - CompileError", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.CompileError(new Error("err1")));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(501);
    })

    it("convertCodeErrorToHttp - NotFoundError", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.MANIFEST, "file1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(404);
    })

    it("convertCodeErrorToHttp - SecurityError - MISSING_CREDENTIALS", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.MISSING_CREDENTIALS, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(401);
    })

    it("convertCodeErrorToHttp - SecurityError - FORBIDDEN", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.FORBIDDEN, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(403);
    })

    it("convertCodeErrorToHttp - SecurityError - INVALID_CREDENTIALS", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.INVALID_CREDENTIALS, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(401);
    })

    it("convertCodeErrorToHttp - SecurityError - PAYLOAD_INVALID", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(400);
    })

    it("convertCodeErrorToHttp - SecurityError - PAYLOAD_LARGE", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_LARGE, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(413);
    })

    it("convertCodeErrorToHttp - SecurityError - THROTTLED", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.THROTTLED, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(429);
    })

    it("convertCodeErrorToHttp - SecurityError - UNCLASSIFIED", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(400);
    })

    it("convertCodeErrorToHttp - SecurityError - NOT MAPPED", function(){
        let securityError:any = new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1");
        securityError.type = -1000;
        let msg = MessageUtil.convertCodeErrorToHttp(securityError);
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(400);
    })

    it("convertCodeErrorToHttp - Internal Server Error", function(){
        let msg = MessageUtil.convertCodeErrorToHttp(new Error("err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(500);
    })
})