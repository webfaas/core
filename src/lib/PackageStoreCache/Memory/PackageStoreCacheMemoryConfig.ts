/**
 * Config
 */
export class PackageStoreCacheMemoryConfig  {
    maxMemory: Number = -1;
    maxEntry: Number = -1;

    constructor(maxMemory?: Number, maxEntry?: Number){
        if (maxMemory !== undefined){
            this.maxMemory = maxMemory;
        }
        if (maxEntry !== undefined){
            this.maxEntry = maxEntry;
        }
    }
}