import { ISemverData } from "./ISemverData";
import { ISemver } from "./ISemver";

//DOC: https://docs.npmjs.com/about-semantic-versioning

export class SmallSemver implements ISemver {
    parseVersion(version: string): ISemverData{
        //<major> "." <minor> "." <patch>
        version = version.toUpperCase();
        let versionDataParsed = {major: "", minor: "", patch: "", pre_release: ""} as ISemverData;
        
        const pos_minor = version.indexOf(".");
    
        if (pos_minor === -1){
            versionDataParsed.major = version;
            return versionDataParsed;
        }
        else{
            versionDataParsed.major = version.substring(0, pos_minor);
        }
    
        const pos_patch = version.indexOf(".", pos_minor + 1);
        if (pos_patch === -1){
            versionDataParsed.minor = version.substring(pos_minor + 1);
            return versionDataParsed;
        }
        else{
            versionDataParsed.minor = version.substring(pos_minor + 1, pos_patch);
        }
    
        const pos_pre_release = version.indexOf("-", pos_patch + 1);
        const pos_build = version.indexOf("+", pos_patch + 1);
        if ((pos_pre_release > -1) && (pos_build === -1)){
            versionDataParsed.patch = version.substring(pos_patch + 1, pos_pre_release);
            versionDataParsed.pre_release = version.substring(pos_pre_release + 1);
        }
        else if ((pos_pre_release > -1) && (pos_build > -1) && (pos_pre_release < pos_build)){
            versionDataParsed.patch = version.substring(pos_patch + 1, pos_pre_release);
            versionDataParsed.pre_release = version.substring(pos_pre_release + 1, pos_build);
        }
        else if ((pos_pre_release > -1) && (pos_build > -1) && (pos_pre_release > pos_build)){
            versionDataParsed.patch = version.substring(pos_patch + 1, pos_build);
            versionDataParsed.pre_release = "";
        }
        else if (pos_build > -1){
            versionDataParsed.patch = version.substring(pos_patch + 1, pos_build);
        }
        else{
            versionDataParsed.patch = version.substring(pos_patch + 1);
        }

        return versionDataParsed;
    }

    valid(value: string): boolean{
        //regex expression obtained from https://semver.org/
        let semverValidRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;
        return semverValidRegex.test(value);
    }

    maxSatisfying(versionsArray:Array<string>, version: string): string | null{
        let maxVersion = {} as ISemverData;

        if (this.valid(version)){
            return version;
        }

        maxVersion.major = "-1";
        maxVersion.minor = "-1";
        maxVersion.patch = "-1";
        
        let prefix_1 = version.substring(0,1);
        //let prefix_2 = version.substring(1,2);
        if (prefix_1 === "^"){
            //include everything greater than a particular version in the same major range
            let versionTargetObj = this.parseVersion(version.substring(1));
            maxVersion.major = versionTargetObj.major;
            versionsArray.forEach((itemVersion)=>{
                let itemVersionObj = this.parseVersion(itemVersion);
                if (itemVersionObj.major === versionTargetObj.major){
                    if (itemVersionObj.minor >= maxVersion.minor){
                        maxVersion.minor = itemVersionObj.minor;
                        maxVersion.patch = itemVersionObj.patch;
                    }
                    /*
                    else if ((itemVersionObj.minor === maxVersion.minor) && (itemVersionObj.patch > maxVersion.patch)){
                        maxVersion.patch = itemVersionObj.patch;
                    }
                    */
                }
            })
        }
        else if (prefix_1 === "~"){
            //include everything greater than a particular version in the same minor range
            let versionTargetObj = this.parseVersion(version.substring(1));
            let flagNotMinor = ((versionTargetObj.minor === "") || (versionTargetObj.minor === "*") || (versionTargetObj.minor === "X"));
            maxVersion.major = versionTargetObj.major;
            versionsArray.forEach((itemVersion)=>{
                let itemVersionObj = this.parseVersion(itemVersion);
                if (itemVersionObj.major === versionTargetObj.major){
                    if (flagNotMinor){
                        if (itemVersionObj.minor > maxVersion.minor){
                            maxVersion.minor = itemVersionObj.minor;
                            maxVersion.patch = itemVersionObj.patch;
                        }
                        else if (itemVersionObj.minor === maxVersion.minor){
                            maxVersion.minor = itemVersionObj.minor;
                            maxVersion.patch = itemVersionObj.patch;
                        }
                    }
                    else if (itemVersionObj.minor === versionTargetObj.minor){
                        if (itemVersionObj.patch > maxVersion.patch){
                            maxVersion.minor = itemVersionObj.minor;
                            maxVersion.patch = itemVersionObj.patch;
                        }
                    }
                }
            })
        }
        else if (prefix_1 === "*"){
            //let versionTargetObj = this.parseVersion(version.substring(1));
            versionsArray.forEach((itemVersion)=>{
                let itemVersionObj = this.parseVersion(itemVersion);
                if (itemVersionObj.major > maxVersion.major){
                    maxVersion.major = itemVersionObj.major;
                    maxVersion.minor = itemVersionObj.minor;
                    maxVersion.patch = itemVersionObj.patch;
                }
                else if (itemVersionObj.major === maxVersion.major){
                    if (itemVersionObj.minor > maxVersion.minor){
                        maxVersion.minor = itemVersionObj.minor;
                        maxVersion.patch = itemVersionObj.patch;
                    }
                    else if ((itemVersionObj.minor === maxVersion.minor) && (itemVersionObj.patch > maxVersion.patch)){
                        maxVersion.patch = itemVersionObj.patch;
                    }
                }
            })
        }
        else{
            let versionTargetObj = this.parseVersion(version);
            let flagNotMinor = ((versionTargetObj.minor === "") || (versionTargetObj.minor === "*") || (versionTargetObj.minor === "X"));
            //let flagNotPatch = ((versionTargetObj.patch === "") || (versionTargetObj.patch === "*") || (versionTargetObj.patch === "X"));
            maxVersion.major = versionTargetObj.major;
            versionsArray.forEach((itemVersion)=>{
                let itemVersionObj = this.parseVersion(itemVersion);
                if (itemVersionObj.major === versionTargetObj.major){
                    if (flagNotMinor){
                        if (itemVersionObj.minor > maxVersion.minor){
                            maxVersion.minor = itemVersionObj.minor;
                        }
                    }
                    else{
                        if (itemVersionObj.minor === versionTargetObj.minor){
                            maxVersion.minor = itemVersionObj.minor;
                        }
                    }
                    if ((itemVersionObj.minor === maxVersion.minor) && (itemVersionObj.patch >= maxVersion.patch)){
                        maxVersion.patch = itemVersionObj.patch;
                    }
                }
            })
        }
    
        if ((maxVersion.major === "-1") || (maxVersion.minor === "-1") || (maxVersion.patch === "-1")){
            return null;
        }
        else{
            return maxVersion.major + "." + maxVersion.minor + "." + maxVersion.patch;
        }
    }
}