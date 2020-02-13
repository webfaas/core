/**
 * Config
 */
export class PackageStoreCacheMemoryConfig  {
    maxMemory: number = -1;
    maxEntry: number = -1;

    constructor(maxMemory?: number, maxEntry?: number){
        if (maxMemory !== undefined){
            this.maxMemory = maxMemory;
        }
        if (maxEntry !== undefined){
            this.maxEntry = maxEntry;
        }
    }
}