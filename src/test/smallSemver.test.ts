import * as chai from "chai";
import * as mocha from "mocha";
import { SmallSemver } from "../lib/Semver/SmallSemver";

const smallSemver = new SmallSemver();

describe("SmallSemver", () => {
    it("correct version", function(){
        let versionsList = [
            "0.0.4",
            "1.2.3",
            "10.20.30",
            "1.1.2-prerelease+meta",
            "1.1.2+meta",
            "1.1.2+meta-valid",
            "1.0.0-alpha",
            "1.0.0-beta",
            "1.0.0-alpha.beta",
            "1.0.0-alpha.beta.1",
            "1.0.0-alpha.1",
            "1.0.0-alpha0.valid",
            "1.0.0-alpha.0valid",
            "1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay",
            "1.0.0-rc.1+build.1",
            "2.0.0-rc.1+build.123",
            "1.2.3-beta",
            "10.2.3-DEV-SNAPSHOT",
            "1.2.3-SNAPSHOT-123",
            "1.0.0",
            "2.0.0",
            "1.1.7",
            "2.0.0+build.1848",
            "2.0.1-alpha.1227",
            "1.0.0-alpha+beta",
            "1.2.3----RC-SNAPSHOT.12.9.1--.12+788",
            "1.2.3----R-S.12.9.1--.12+meta",
            "1.2.3----RC-SNAPSHOT.12.9.1--.12",
            "1.0.0+0.build.1-rc.10000aaa-kk-0.1",
            "99999999999999999999999.999999999999999999.99999999999999999",
            "1.0.0-0A.is.legal"
        ]
        
        for (let i = 0; i < versionsList.length; i++){
            let version = versionsList[i];
            chai.expect(smallSemver.valid(version), version).to.eq(true);
            let versionParsedObj = smallSemver.parseVersion(version);
            let versionParsedText = versionParsedObj.major + "." + versionParsedObj.minor + "." + versionParsedObj.patch;
            if (versionParsedObj.pre_release){
                chai.expect(version.toUpperCase().indexOf(versionParsedObj.pre_release), versionParsedObj.pre_release + " IN " + version.toUpperCase()).to.gt(-1);
            }
            chai.expect(version.indexOf(versionParsedText), versionParsedText + " -> " + version).to.gt(-1);
        }
    })

    it("incorrect version", function(){
        let versionsList = [
            "1",
            "1.2",
            "1.2.3-0123",
            "1.2.3-0123.0123",
            "1.1.2+.123",
            "+invalid",
            "-invalid",
            "-invalid+invalid",
            "-invalid.01",
            "alpha",
            "alpha.beta",
            "alpha.beta.1",
            "alpha.1",
            "alpha+beta",
            "alpha_beta",
            "alpha.",
            "alpha..",
            "beta",
            "1.0.0-alpha_beta",
            "-alpha.",
            "1.0.0-alpha..",
            "1.0.0-alpha..1",
            "1.0.0-alpha...1",
            "1.0.0-alpha....1",
            "1.0.0-alpha.....1",
            "1.0.0-alpha......1",
            "1.0.0-alpha.......1",
            "01.1.1",
            "1.01.1",
            "1.1.01",
            "1.2",
            "1.2.3.DEV",
            "1.2-SNAPSHOT",
            "1.2.31.2.3----RC-SNAPSHOT.12.09.1--..12+788",
            "1.2-RC-SNAPSHOT",
            "-1.0.3-gamma+b7718",
            "+justmeta",
            "9.8.7+meta+meta",
            "9.8.7-whatever+meta+meta"
        ]

        for (let i = 0; i < versionsList.length; i++){
            let version = versionsList[i];
            chai.expect(smallSemver.valid(version), version).to.eq(false);
        }
    })

    it("maxSatisfying", function(){
        let versionsArray:Array<string> = ["1.0.0", "1.1.0", "1.1.1", "1.2.0", "1.2.1", "1.3.0", "1.0.1", "1.3.1", "1.3.1-PRERELEASE1", "1.3.1-PRERELEASE2", "2.0.0", "2.1.0", "3.5.5", "3.5.4", "3.5.3", "3.5.2", "3.5.1", "3.5.0", "0.0.1", "0.1.0"];
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1"), "^1").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1.*"), "^1.*").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1.x"), "^1.x").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1.1"), "^1.1").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1.1.x"), "^1.1.x").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "^1.1.*"), "^1.1.*").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1"), "~1").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1.*"), "~1.*").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1.x"), "~1.x").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1.1"), "~1.1").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1.1.x"), "~1.1.x").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~1.1.*"), "~1.1.*").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "~3.5.0"), "~3.5.0").to.eq("3.5.5");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "*"), "*").to.eq("3.5.5");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1"), "1").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "2"), "2").to.eq("2.1.0");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "3"), "3").to.eq("3.5.5");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.*"), "1.*").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.x"), "1.x").to.eq("1.3.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.1"), "1.1").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.1.x"), "1.1.x").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.1.*"), "1.1.*").to.eq("1.1.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.2.1"), "1.2.1").to.eq("1.2.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.2.x"), "1.2.x").to.eq("1.2.1");
        chai.expect(smallSemver.maxSatisfying(versionsArray, "1.2.*"), "1.2.*").to.eq("1.2.1");
    })
})