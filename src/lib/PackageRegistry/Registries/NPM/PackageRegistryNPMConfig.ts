import { ClientHTTPConfig } from "../../../ClientHTTP/ClientHTTPConfig";
import { ClientHTTP } from "../../../ClientHTTP/ClientHTTP";

export class PackageRegistryNPMConfig  {
    url: string
    token: string
    httpConfig: ClientHTTPConfig

    constructor(url?: string, httpConfig?: ClientHTTPConfig, token?: string){
        if (url){
            this.url = url;
        }
        else{
            this.url = "https://registry.npmjs.org";
        }

        if (httpConfig){
            this.httpConfig = httpConfig;
        }
        else{
            this.httpConfig = new ClientHTTPConfig();
        }

        if (token){
            this.token = token;
        }
        else{
            this.token = "";
        }
    }
}