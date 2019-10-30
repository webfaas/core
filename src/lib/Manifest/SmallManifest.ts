export class SmallManifest {
    name: string;
    versionsArray: string[];

    constructor(name: string, versionsArray: string[]){
        this.name = name;
        this.versionsArray = versionsArray;
    }
}