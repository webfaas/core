import { IPackageRegistry } from "../../IPackageRegistry";
import { PackageRegistryHTTPNPMConfig } from "./PackageRegistryHTTPNPMConfig";
import { ClientHTTP } from "../../../ClientHTTP/ClientHTTP";
import { IClientHTTPResponse } from "../../../ClientHTTP/IClientHTTPResponse";
import { IPackageRegistryResponse, PackageRegistryResponseFormatEnum } from "../../IPackageRegistryResponse";
import { IncomingHttpHeaders } from "http";

export class PackageRegistryHTTPNPM implements IPackageRegistry {
    private config: PackageRegistryHTTPNPMConfig;
    private clientHTTP: ClientHTTP;

    constructor(config?: PackageRegistryHTTPNPMConfig){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageRegistryHTTPNPMConfig();
        }

        this.clientHTTP = new ClientHTTP(this.config.httpConfig);
    }

    private buildHeaders(): IncomingHttpHeaders{
        var headers: IncomingHttpHeaders = {};

        headers["user-agent"] = "functions-io-core";
        if (this.config.token){
            headers["authorization"] = "Bearer " + this.config.token;
        }
        return headers;
    }

    getManifest(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>{
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

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url);

                manifestResponseObj.format = PackageRegistryResponseFormatEnum.MANIFEST_UNCOMPRESSED.toString();
                manifestResponseObj.etag = "";

                var header_etag = respHTTP.headers["etag"];
                if (header_etag){
                    manifestResponseObj.etag = header_etag.toString();
                }

                if (respHTTP.statusCode === 200){
                    manifestResponseObj.data = respHTTP.data;

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    manifestResponseObj.data = null;

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    manifestResponseObj.data = null;

                    resolve(manifestResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        })
    }
}