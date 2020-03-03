import * as path from "path";
import * as chai from "chai";
import { DirectoryFSUtil } from "../lib/Util/DirectoryFSUtil";


describe("DirectoryFSUtil", () => {
    it("should return response on call", () => {
        chai.expect(DirectoryFSUtil.getMainDirectory()).to.eq(path.dirname((<NodeModule> require.main).filename));
        
        DirectoryFSUtil.setMainDirectory("folder1");
        chai.expect(DirectoryFSUtil.getMainDirectory()).to.eq("folder1");

        DirectoryFSUtil.setMainDirectory(path.dirname((<NodeModule> require.main).filename));
        chai.expect(DirectoryFSUtil.getMainDirectory()).to.eq(path.dirname((<NodeModule> require.main).filename));
    })
})