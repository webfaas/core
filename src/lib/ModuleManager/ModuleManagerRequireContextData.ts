/**
 * manager Module Require Context Data
 */
export class ModuleManagerRequireContextData {
    public rootPackageStoreKey: string;
    public parentPackageStoreName: string;
    public parentPackageStoreVersion: string;
    
    constructor(rootPackageStoreKey: string, parentPackageStoreName?: string, parentPackageStoreVersion?: string){
        this.rootPackageStoreKey = rootPackageStoreKey;
        this.parentPackageStoreName = parentPackageStoreName || "";
        this.parentPackageStoreVersion = parentPackageStoreVersion || "";
    }
}