import * as path from "path";

export class ModuleCompileManifestData {
    name: string;
    version: string;
    mainFileDirName: string;
    mainFileFullPath: string;

    constructor(name: string, version: string, mainFileFullPath: string) {
        this.name = name;
        this.version = version;
        this.mainFileFullPath = mainFileFullPath;
        this.mainFileDirName = path.dirname(this.mainFileFullPath);
    }
}