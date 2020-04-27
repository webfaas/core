import * as chai from "chai";
import { MessageUtil } from "../lib/Util/MessageUtil";

describe("MessageUtil", () => {

    it("parseString", function(){
        chai.expect(MessageUtil.parseString("1")).to.eq("1");
        chai.expect(MessageUtil.parseString(null)).to.eq("");
    })

    it("urlPath - module1", function(){
        let msg = MessageUtil.parseMessageByUrlPath("module1", "", null, "", null);
        let header = msg?.header;
        chai.expect(header).to.not.null;
    })
})