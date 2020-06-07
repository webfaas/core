import { IPackageRegistry } from "../../lib/PackageRegistry/IPackageRegistry";
import { IPackageRegistryResponse } from "../../lib/PackageRegistry/IPackageRegistryResponse";
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
            return new Promise((resolve, reject)=>{
                resolve();
            })
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
            let nameMathSumAsyncDependencyVersionEmpty:string = "@registry1/mathsumasyncdependencyversionempty";
            let nameSimpleText:string = "@registry1/simpletext";
            let nameHostName:string = "@registry1/hostname";
            let nameSyntaxError:string = "@registry1/syntaxerror";
            let nameExecutionError:string = "@registry1/executionerror";
            let nameModuleWhitoutExport:string = "@registry1/modulewhitoutexport";
            let nameInternalRelativeDependency = "@registry1/internalrelativedependency";
            let nameInternalRelativeDependencyNotFound = "@registry1/internalRelativeDependencyNotFound";
            let nameModuleDependencyNotFound = "@registry1/moduledependencynotfound"
            let nameModuleDependencyNotDeclared = "@registry1/moduledependencynotdeclared";
            let nameMathSumWasm = "@registry1/mathsumwasm";
            let nameMathMessage = "@registry1/mathmessage";
            let nameSimpleMessage = "@registry1/simplemessage";
            let nameContextMessage = "@registry1/contextmessage";
            
            let description: string = "registry1 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry1/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry1/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameMathSumAsyncDependencyVersionEmpty, new PackageRegistryResponseMock.Manifest(nameMathSumAsyncDependencyVersionEmpty, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsyncDependencyVersionEmpty + ":0.0.1", new PackageRegistryResponseMock.MathSumAsyncDependencyVersionEmpty(nameMathSumAsyncDependencyVersionEmpty, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSimpleText + ":0.0.1", new PackageRegistryResponseMock.SimpleText(nameSimpleText, "0.0.1", description, "AA1", "BB1", "CC1"));

            this.listPackageRegistryResponse.set(nameHostName, new PackageRegistryResponseMock.Manifest(nameHostName, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameHostName + ":0.0.1", new PackageRegistryResponseMock.HostName(nameHostName, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSyntaxError, new PackageRegistryResponseMock.Manifest(nameSyntaxError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameSyntaxError + ":0.0.1", new PackageRegistryResponseMock.SyntaxError(nameSyntaxError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameExecutionError, new PackageRegistryResponseMock.Manifest(nameExecutionError, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameExecutionError + ":0.0.1", new PackageRegistryResponseMock.ExecutionError(nameExecutionError, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameModuleWhitoutExport, new PackageRegistryResponseMock.Manifest(nameModuleWhitoutExport, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameModuleWhitoutExport + ":0.0.1", new PackageRegistryResponseMock.ModuleWhitoutExport(nameModuleWhitoutExport, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameInternalRelativeDependency, new PackageRegistryResponseMock.Manifest(nameInternalRelativeDependency, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameInternalRelativeDependency + ":0.0.1", new PackageRegistryResponseMock.InternalRelativeDependency(nameInternalRelativeDependency, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameInternalRelativeDependencyNotFound, new PackageRegistryResponseMock.Manifest(nameInternalRelativeDependencyNotFound, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameInternalRelativeDependencyNotFound + ":0.0.1", new PackageRegistryResponseMock.InternalRelativeDependencyNotFound(nameInternalRelativeDependencyNotFound, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameModuleDependencyNotFound, new PackageRegistryResponseMock.Manifest(nameModuleDependencyNotFound, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameModuleDependencyNotFound + ":0.0.1", new PackageRegistryResponseMock.ModuleDependencyNotFound(nameModuleDependencyNotFound, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameModuleDependencyNotDeclared, new PackageRegistryResponseMock.Manifest(nameModuleDependencyNotDeclared, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameModuleDependencyNotDeclared + ":0.0.1", new PackageRegistryResponseMock.ModuleDependencyNotDeclared(nameModuleDependencyNotDeclared, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameMathSumWasm, new PackageRegistryResponseMock.Manifest(nameMathSumWasm, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameMathSumWasm + ":0.0.1", new PackageRegistryResponseMock.MathSumWasm(nameMathSumWasm, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameMathMessage, new PackageRegistryResponseMock.Manifest(nameMathMessage, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameMathMessage + ":0.0.1", new PackageRegistryResponseMock.MathMessage(nameMathMessage, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameSimpleMessage, new PackageRegistryResponseMock.Manifest(nameSimpleMessage, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameSimpleMessage + ":0.0.1", new PackageRegistryResponseMock.SimpleMessage(nameSimpleMessage, "0.0.1", description));

            this.listPackageRegistryResponse.set(nameContextMessage, new PackageRegistryResponseMock.Manifest(nameContextMessage, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameContextMessage + ":0.0.1", new PackageRegistryResponseMock.ContextMessage(nameContextMessage, "0.0.1", description));
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

            let description: string = "registry2 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry2/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry2/mathsum": "0.*"}, description));

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
            
            let description: string = "registry3 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry3/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry3/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameSimpleText + ":0.0.1", new PackageRegistryResponseMock.SimpleText(nameSimpleText, "0.0.1", description, "AA3", "BB3", "CC3"));
        }
    }
}