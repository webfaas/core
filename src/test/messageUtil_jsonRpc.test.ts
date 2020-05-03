import * as chai from "chai";
import { MessageUtil, JsonRpcErrorTypeEnum, IJsonRpcResponse, IJsonRpcRequest } from "../lib/Util/MessageUtil";
import { WebFaasError } from "../lib/WebFaasError/WebFaasError";

describe("MessageUtil - jsonRpc", () => {
    it("parseJsonRpcRequest - PARSE_ERROR - PAYLOAD_INVALID", function(){
        try {
            let msg = MessageUtil.parseJsonRpcRequest("{");
            throw new Error("Success");
        }
        catch (errTry) {
            chai.expect(errTry.type).to.eq("PAYLOAD_INVALID");
        }
    })

    it("parseJsonRpcRequest - PARSE_ERROR - payload null - PAYLOAD_INVALID", function(){
        try {
            let msg = MessageUtil.parseJsonRpcRequest(null);
            throw new Error("Success");
        }
        catch (errTry) {
            chai.expect(errTry.type).to.eq("PAYLOAD_INVALID");
        }
    })

    it("parseJsonRpcRequest - INVALID_REQUEST", function(){
        try {
            let msg = MessageUtil.parseJsonRpcRequest("{}");
            throw new Error("Success");
        }
        catch (errTry) {
            chai.expect(errTry.type).to.eq("METHOD");
        }
    })

    it("parseJsonRpcRequest - method1", function(){
        let msg = MessageUtil.parseJsonRpcRequest('{"method":"method1", "id":"001"}');
        chai.expect(msg).to.not.null;
        chai.expect(msg.method).to.eq("method1");
        chai.expect(msg.id).to.eq("001");
    })

    it("parseJsonRpcRequest - parseJsonRpcResponseSuccess", function(){
        let msg = MessageUtil.parseJsonRpcResponseSuccess("AA", 1);
        chai.expect(msg.id).to.eq(1);
        chai.expect(msg.result).to.eq("AA");
    })

    it("parseJsonRpcResponseError", function(){
        let msg = MessageUtil.parseJsonRpcResponseError(JsonRpcErrorTypeEnum.PARSE_ERROR, "message1");
        chai.expect(msg.error).to.not.null;
        chai.expect(msg.error?.code).to.eq(JsonRpcErrorTypeEnum.PARSE_ERROR);
        chai.expect(msg.error?.message).to.eq("message1");
    })

    it("parseMessageByPayloadJsonRpc - {}", function(){
        let msg = MessageUtil.parseMessageByPayloadJsonRpc({} as IJsonRpcRequest)
        chai.expect(msg).to.null;
    })

    it("parseMessageByPayloadJsonRpc - {method:method1}", function(){
        let msg = MessageUtil.parseMessageByPayloadJsonRpc({method:"method1"} as IJsonRpcRequest);
        chai.expect(msg).to.null;
    })

    it("parseMessageByPayloadJsonRpc - module1/version1", function(){
        let msg = MessageUtil.parseMessageByPayloadJsonRpc({method:"module1/version1", id:"001"} as IJsonRpcRequest)
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("001");
        chai.expect(header?.http).to.undefined;
        chai.expect(header?.authorization).to.undefined;
        chai.expect(header?.identity).to.undefined;
    })

    it("parseMessageByPayloadJsonRpc - /path1", function(){
        let msg = MessageUtil.parseMessageByPayloadJsonRpc({method:"module1/version1"} as IJsonRpcRequest, "/path1")
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
        chai.expect(header?.identity).to.undefined;
       
        chai.expect(header?.authorization).to.undefined;
    })

    it("parseMessageByPayloadJsonRpc - /path1 POST Bearer AAA", function(){
        let msg = MessageUtil.parseMessageByPayloadJsonRpc({method:"module1/version1", id:"001"} as IJsonRpcRequest, "/path1", "POST", {"Authorization": "Bearer AAA"})
        let header = msg?.header;
        chai.expect(header).to.not.null;
        chai.expect(header?.name).to.eq("module1");
        chai.expect(header?.version).to.eq("version1.*");
        chai.expect(header?.method).to.eq("");
        chai.expect(header?.messageID).to.eq("001");
        chai.expect(header?.http).to.not.undefined;
        chai.expect(header?.http?.headers).to.not.null;
        chai.expect(header?.http?.headers["Authorization"]).to.eq("Bearer AAA");
        chai.expect(header?.http?.method).to.eq("POST");
        chai.expect(header?.http?.path).to.eq("/path1");
        chai.expect(header?.identity).to.undefined;
       
        chai.expect(header?.authorization).to.not.undefined;
        chai.expect(header?.authorization?.type).to.eq("bearer");
        chai.expect(header?.authorization?.token).to.eq("AAA");
    })

    //
    //convertCodeErrorToJsonRpc
    //

    it("convertCodeErrorToJsonRpc - ClientHttpError", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.ClientHttpError("err1", "url1", "method1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32600);
    })

    it("convertCodeErrorToHttp - ValidateError", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.ValidateError("001", "field1", "message1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32600);
    })

    it("convertCodeErrorToJsonRpc - CompileError", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.CompileError("err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - NotFoundError", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.NotFoundError(WebFaasError.NotFoundErrorTypeEnum.MANIFEST, "file1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32601);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - MISSING_CREDENTIALS", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.MISSING_CREDENTIALS, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - FORBIDDEN", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.FORBIDDEN, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - INVALID_CREDENTIALS", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.INVALID_CREDENTIALS, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - PAYLOAD_INVALID", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32600);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - PAYLOAD_LARGE", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_LARGE, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32600);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - THROTTLED", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.THROTTLED, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - UNCLASSIFIED", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - SecurityError - NOT MAPPED", function(){
        let securityError:any = new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.UNCLASSIFIED, "err1");
        securityError.type = -1000;
        let msg = MessageUtil.convertCodeErrorToJsonRpc(securityError);
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })

    it("convertCodeErrorToJsonRpc - Internal Server Error", function(){
        let msg = MessageUtil.convertCodeErrorToJsonRpc(new Error("err1"));
        chai.expect(msg).to.not.null;
        chai.expect(msg.code).to.eq(-32000);
    })
})