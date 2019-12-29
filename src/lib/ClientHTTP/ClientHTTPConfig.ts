import { KeyObject, PxfObject } from "tls";

export class ClientHTTPConfig  {
    timeout: number = 100000
    rejectUnauthorized: boolean = true
    keepAlive: boolean = true
    maxSockets: number = 2

    // Necessary only if the server requires client certificate authentication.
    key?: string | Buffer | Array<Buffer | KeyObject>;
    cert?: string | Buffer | Array<string | Buffer>;

    //pfx is an alternative to providing key and cert
    pfx?: string | Buffer | Array<string | Buffer | PxfObject>;

    // Necessary only if the server uses a self-signed certificate.
    ca?: string | Buffer | Array<string | Buffer>;
}