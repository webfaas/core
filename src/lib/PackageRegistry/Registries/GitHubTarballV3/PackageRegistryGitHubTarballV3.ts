import { IPackageRegistry } from "../../IPackageRegistry";
import { PackageRegistryGitHubTarballV3Config } from "./PackageRegistryGitHubTarballV3Config";
import { ClientHTTP } from "../../../ClientHTTP/ClientHTTP";
import { IClientHTTPResponse } from "../../../ClientHTTP/IClientHTTPResponse";
import { IncomingHttpHeaders } from "http";
import { IPackageRegistryResponse } from "../../IPackageRegistryResponse";
import { PackageStore } from "../../../PackageStore/PackageStore";
import { PackageStoreUtil } from "../../../PackageStore/PackageStoreUtil";
import { IPackageStoreItemData } from "../../../PackageStore/IPackageStoreItemData";
import { Log } from "../../../Log/Log";
import { IManifest } from "../../../Manifest/IManifest";

//doc api
//https://developer.github.com/v3/
//https://developer.github.com/v3/repos/contents/#get-archive-link

export class PackageRegistryGitHubTarballV3 implements IPackageRegistry {
    private config: PackageRegistryGitHubTarballV3Config;
    private clientHTTP: ClientHTTP;
    private log: Log;
    
    constructor(config?: PackageRegistryGitHubTarballV3Config, log?: Log){
        this.config = config || new PackageRegistryGitHubTarballV3Config();
        this.log = log || Log.getInstance();

        this.clientHTTP = new ClientHTTP(this.config.httpConfig, this.log);
    }

    private buildHeaders(): IncomingHttpHeaders{
        var headers: IncomingHttpHeaders = {};

        headers["user-agent"] = "webfaas";
        if (this.config.token){
            headers["authorization"] = "Bearer " + this.config.token;
        }
        headers["accept"] = "application/vnd.github.v3+json";
        return headers;
    }

    /**
     * return type name
     */
    getTypeName(): string{
        return "GitHubTarballV3";
    }

    /**
     * return config
     */
    getConfig(): PackageRegistryGitHubTarballV3Config{
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
                
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                //ex: https://api.github.com/repos/webfaaslabs/mathsum/tags
                
                var url = this.config.url + "/repos/" + name.replace("@", "") + "/tags";

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);

                if (respHTTP.statusCode === 200){
                    var temp_header_etag = respHTTP.headers["etag"];
                    var header_etag: string = "";

                    if (temp_header_etag){
                        header_etag = temp_header_etag.toString();
                    }

                    var listTags: any = JSON.parse(respHTTP.data.toString());
                    var versions = {} as any;
                    for (var i = 0; i < listTags.length; i++){
                        var itemTag: any = listTags[i];
                        versions[itemTag.name] = {name:name,"version":itemTag.name, description: itemTag.commit.sha};
                    }
                    var manifestObj = {} as IManifest;
                    manifestObj.name = name;
                    manifestObj.versions = versions;
                    var packageBuffer: Buffer = Buffer.from(JSON.stringify(manifestObj));
                    manifestResponseObj.packageStore = PackageStoreUtil.buildPackageStoreSingleItemFromBuffer(name, "", header_etag, packageBuffer, "package.json");

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
                
                //ex: https://api.github.com/repos/webfaaslabs/mathsum/tarball/0.0.1
                
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                var versionDownload = version;
                if (versionDownload.indexOf("0.0.0-") > -1){
                    versionDownload = versionDownload.split("-")[1];
                }
                var url = this.config.url + "/repos/" + name.replace("@", "") + "/tarball/" + versionDownload;

                var respHTTP: IClientHTTPResponse;

                respHTTP = await this.clientHTTP.request(url, "GET", undefined, headers);

                if ((respHTTP.statusCode === 302) && (respHTTP.headers.location)){ //redirect
                    respHTTP = await this.clientHTTP.request(respHTTP.headers.location, "GET", undefined, headers);
                }
                
                if (respHTTP.statusCode === 200){
                    var temp_header_etag = respHTTP.headers["etag"];

                    if (temp_header_etag === etag){ //github not support tarball etag ????
                        //SIMULATE NOT MODIFIED
                        manifestResponseObj.packageStore = null;
                        manifestResponseObj.etag = etag || "";
    
                        resolve(manifestResponseObj);
                    }
                    else{
                        var header_etag: string = "";
                        var bufferDecompressed: Buffer = PackageStoreUtil.unzipSync(respHTTP.data);
                        var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = PackageStoreUtil.converBufferTarFormatToMapPackageItemDataMap(bufferDecompressed);
    
                        if (temp_header_etag){
                            header_etag = temp_header_etag.toString();
                        }
                        
                        manifestResponseObj.packageStore = new PackageStore(name, version, header_etag, bufferDecompressed, dataPackageItemDataMap);
    
                        resolve(manifestResponseObj);
                    }
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
}