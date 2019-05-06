import { IncomingHttpHeaders } from "http";

export interface IClientHTTPResponse {
    error: any
    statusCode: number
    headers: IncomingHttpHeaders
    data: Buffer
}