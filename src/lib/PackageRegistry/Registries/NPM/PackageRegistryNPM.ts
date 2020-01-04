import { IPackageRegistry } from "../../IPackageRegistry";
import { PackageRegistryNPMConfig } from "./PackageRegistryNPMConfig";
import { ClientHTTP } from "../../../ClientHTTP/ClientHTTP";
import { IClientHTTPResponse } from "../../../ClientHTTP/IClientHTTPResponse";
import { IncomingHttpHeaders } from "http";
import { IPackageRegistryResponse } from "../../IPackageRegistryResponse";
import { PackageStore } from "../../../PackageStore/PackageStore";
import { PackageStoreUtil } from "../../../PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../../../PackageStore/IPackageStoreItemData";
import { Log } from "../../../Log/Log";

export class PackageRegistryNPM implements IPackageRegistry {
    private config: PackageRegistryNPMConfig;
    private clientHTTP: ClientHTTP;
    private log: Log;
    
    constructor(config?: PackageRegistryNPMConfig, log?: Log){
        this.config = config || new PackageRegistryNPMConfig();
        this.log = log || Log.getInstance();

        this.clientHTTP = new ClientHTTP(this.config.httpConfig, this.log);
    }

    private buildHeaders(): IncomingHttpHeaders{
        var headers: IncomingHttpHeaders = {};

        headers["user-agent"] = "webfaas";
        if (this.config.token){
            headers["authorization"] = "Bearer " + this.config.token;
        }
        return headers;
    }

    /**
     * return type name
     */
    getTypeName(): string{
        return "NPM";
    }

    /**
     * return config
     */
    getConfig(): PackageRegistryNPMConfig{
        return this.config;
    }

    /**
     * return manifest in IPackageRegistryResponse
     * @param name manifest name
     * @param etag manifest etag
     */
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>{
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var manifestResponseObj = {} as IPackageRegistryResponse;
                
                //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
                headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                var url = this.config.url + "/" + name;

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);

                if (respHTTP.statusCode === 200){
                    var temp_header_etag = respHTTP.headers["etag"];
                    var header_etag: string = "";

                    if (temp_header_etag){
                        header_etag = temp_header_etag.toString();
                    }

                    manifestResponseObj.packageStore = PackageStoreUtil.buildPackageStoreSingleItemFromBuffer(name, "", header_etag, respHTTP.data, "package.json");

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = etag || "";

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = "";

                    resolve(manifestResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    /**
     * return package in IPackageRegistryResponse
     * @param name package name
     * @param version package version
     * @param etag package etag
     */
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var manifestResponseObj = {} as IPackageRegistryResponse;
                
                //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
                headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                //let listURL = self.getListURLFromModuleName(name, "/" + name + "/-/" + name + "-" + versionTarget + ".tgz");
                var url = this.config.url + "/" + name + "/-/" + name + "-" + version + ".tgz";

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);
                
                if (respHTTP.statusCode === 200){
                    var temp_header_etag = respHTTP.headers["etag"];
                    var header_etag: string = "";
                    var bufferDecompressed: Buffer = PackageStoreUtil.unzipSync(respHTTP.data);
                    var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.converBufferTarFormatToMapPackageItemDataMap(bufferDecompressed);

                    if (temp_header_etag){
                        header_etag = temp_header_etag.toString();
                    }
                    
                    manifestResponseObj.packageStore = new PackageStore(name, version, header_etag, bufferDecompressed, dataPackageItemDataMap);

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = etag || "";

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = "";

                    resolve(manifestResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    start(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.clientHTTP){
                this.clientHTTP.destroy();
            }
            resolve();
        })
    }
}