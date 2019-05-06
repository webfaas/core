export class ClientHTTPConfig  {
    timeout: number = 100000
    rejectUnauthorized: boolean = true
    keepAlive: boolean = true
    maxSockets: number = 2
}