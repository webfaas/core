import * as fs from "fs";
import * as path from "path";

var mainDirectory: string = path.dirname((<NodeModule> require.main).filename);

export class DirectoryFSUtil  {
    public static getMainDirectory(): string{
        return mainDirectory;
    }
    public static setMainDirectory(value: string): void{
        mainDirectory = value;
    }
}