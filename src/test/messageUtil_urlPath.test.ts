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
    //convertErrorToCodeHttp
    //

    it("convertErrorToCodeHttp - ClientHttpError", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.ClientHttpError(new Error("err1"), "url1", "method1"))).to.eq(502);
    })

    it("convertErrorToCodeHttp - ValidateError", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.ValidateError("001", "field1", "message1"))).to.eq(400);
    })

    it("convertErrorToCodeHttp - CompileError", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.CompileError(new Error("err1")))).to.eq(501);
    })

    it("convertErrorToCodeHttp - NotFoundError", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.MANIFEST, "file1"))).to.eq(404);
    })

    it("convertErrorToCodeHttp - SecurityError - MISSING_CREDENTIALS", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.MISSING_CREDENTIALS, "err1"))).to.eq(401);
    })

    it("convertErrorToCodeHttp - SecurityError - FORBIDDEN", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.FORBIDDEN, "err1"))).to.eq(403);
    })

    it("convertErrorToCodeHttp - SecurityError - INVALID_CREDENTIALS", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.INVALID_CREDENTIALS, "err1"))).to.eq(401);
    })

    it("convertErrorToCodeHttp - SecurityError - PAYLOAD_INVALID", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "err1"))).to.eq(400);
    })

    it("convertErrorToCodeHttp - SecurityError - PAYLOAD_LARGE", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_LARGE, "err1"))).to.eq(413);
    })

    it("convertErrorToCodeHttp - SecurityError - THROTTLED", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.THROTTLED, "err1"))).to.eq(429);
    })

    it("convertErrorToCodeHttp - SecurityError - UNCLASSIFIED", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1"))).to.eq(400);
    })

    it("convertErrorToCodeHttp - SecurityError - NOT MAPPED", function(){
        let securityError:any = new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1");
        securityError.type = -1000;
        chai.expect(MessageUtil.convertErrorToCodeHttp(securityError)).to.eq(400);
    })

    it("convertErrorToCodeHttp - Internal Server Error", function(){
        chai.expect(MessageUtil.convertErrorToCodeHttp(new Error("err1"))).to.eq(500);
    })
})