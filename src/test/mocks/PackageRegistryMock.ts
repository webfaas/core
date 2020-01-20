import { IPackageRegistry } from "../../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../../lib/PackageRegistry/IPackageRegistryResponse";
import { PackageStore } from "../../lib/PackageStore/PackageStore";
import { IPackageStoreItemData } from "../../lib/PackageStore/IPackageStoreItemData";
import { PackageStoreUtil } from "../../lib/PackageStore/PackageStoreUtil";
import { PackageRegistryResponseMock } from "./PackageRegistryResponseMock";

export namespace PackageRegistryMock{
    export class PackageRegistryError implements IPackageRegistry {
        getTypeName(): string{
            return "REGISTRYERROR";
        }
        getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse> {
            throw new Error("getManifest not implemented.");
        }
        getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse> {
            throw new Error("getPackage not implemented.");
        }
        start(): Promise<any> {
            throw new Error("Method not implemented.");
        }
        stop(): Promise<any> {
            throw new Error("Method not implemented.");
        }
    }

    abstract class AbstractPackageRegistry implements IPackageRegistry {
        public listPackageRegistryResponse: Map<string, IPackageRegistryResponse> = new Map<string, IPackageRegistryResponse>();
        
        abstract getTypeName(): string

        getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse> {
            return new Promise((resolve, reject)=>{
                let responseObj = this.listPackageRegistryResponse.get(name);
                if (responseObj){
                    resolve(responseObj);
                }
                else{
                    let responseNotFoundObj = {} as IPackageRegistryResponse;
                    responseNotFoundObj.packageStore = null;
                    responseNotFoundObj.etag = "";
                    resolve(responseNotFoundObj);
                }
            });
        }
        
        getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>{
            return new Promise((resolve, reject)=>{
                let responseObj = this.listPackageRegistryResponse.get(name + ":" + version) || null;
                if (responseObj){
                    resolve(responseObj);
                }
                else{
                    let responseNotFoundObj = {} as IPackageRegistryResponse;
                    responseNotFoundObj.packageStore = null;
                    responseNotFoundObj.etag = "";
                    resolve(responseNotFoundObj);
                }
            });
        }

        async start() {
        }

        async stop() {
        }
    }
    
    export class PackageRegistry1 extends AbstractPackageRegistry {
        getTypeName(): string{
            return "REGISTRY1";
        }
        
        constructor(){
            super();
            let nameMathSum:string = "@registry1/mathsum";
            let nameMathSumAsync:string = "@registry1/mathsumasync";
            let nameSimpleText:string = "@registry1/simpletext";
            let nameHostName:string = "@registry1/hostname";
            let nameSyntaxError:string = "@registry1/syntaxerror";
            let nameExecutionError:string = "@registry1/executionerror";

            let description: string = "registry1 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry1/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry1/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameHostName, new PackageRegistryResponseMock.Manifest(nameHostName, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameHostName + ":0.0.1", new PackageRegistryResponseMock.HostName(nameHostName, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSyntaxError, new PackageRegistryResponseMock.Manifest(nameSyntaxError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameSyntaxError + ":0.0.1", new PackageRegistryResponseMock.SyntaxError(nameSyntaxError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameExecutionError, new PackageRegistryResponseMock.Manifest(nameExecutionError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameExecutionError + ":0.0.1", new PackageRegistryResponseMock.ExecutionError(nameExecutionError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSimpleText + ":0.0.1", new PackageRegistryResponseMock.SimpleText(nameSimpleText, "0.0.1", description, "AA1", "BB1", "CC1"));
        }
    }
    
    export class PackageRegistry2 extends AbstractPackageRegistry {
        getTypeName(): string{
            return "REGISTRY2";
        }
        
        constructor(){
            super();
            let nameMathSum:string = "@registry2/mathsum";
            let nameMathSumAsync:string = "@registry2/mathsumasync";
            let nameSimpleText:string = "@registry2/simpletext";
            let nameHostName:string = "@registry2/hostname";
            let nameSyntaxError:string = "@registry2/syntaxerror";
            let nameExecutionError:string = "@registry2/executionerror";

            let description: string = "registry2 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry2/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry2/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameHostName, new PackageRegistryResponseMock.Manifest(nameHostName, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameHostName + ":0.0.1", new PackageRegistryResponseMock.HostName(nameHostName, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSyntaxError, new PackageRegistryResponseMock.Manifest(nameSyntaxError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameSyntaxError + ":0.0.1", new PackageRegistryResponseMock.SyntaxError(nameSyntaxError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameExecutionError, new PackageRegistryResponseMock.Manifest(nameExecutionError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameExecutionError + ":0.0.1", new PackageRegistryResponseMock.ExecutionError(nameExecutionError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSimpleText + ":0.0.1", new PackageRegistryResponseMock.SimpleText(nameSimpleText, "0.0.1", description, "AA2", "BB2", "CC2"));
        }
    }
    
    export class PackageRegistry3 extends AbstractPackageRegistry {
        getTypeName(): string{
            return "REGISTRY3";
        }
        
        constructor(){
            super();
            let nameMathSum:string = "@registry3/mathsum";
            let nameMathSumAsync:string = "@registry3/mathsumasync";
            let nameSimpleText:string = "@registry3/simpletext";
            let nameHostName:string = "@registry3/hostname";
            let nameSyntaxError:string = "@registry3/syntaxerror";
            let nameExecutionError:string = "@registry3/executionerror";

            let description: string = "registry3 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry3/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry3/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameHostName, new PackageRegistryResponseMock.Manifest(nameHostName, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameHostName + ":0.0.1", new PackageRegistryResponseMock.HostName(nameHostName, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSyntaxError, new PackageRegistryResponseMock.Manifest(nameSyntaxError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameSyntaxError + ":0.0.1", new PackageRegistryResponseMock.SyntaxError(nameSyntaxError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameExecutionError, new PackageRegistryResponseMock.Manifest(nameExecutionError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameExecutionError + ":0.0.1", new PackageRegistryResponseMock.ExecutionError(nameExecutionError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSimpleText + ":0.0.1", new PackageRegistryResponseMock.SimpleText(nameSimpleText, "0.0.1", description, "AA3", "BB3", "CC3"));
        }
    }
}