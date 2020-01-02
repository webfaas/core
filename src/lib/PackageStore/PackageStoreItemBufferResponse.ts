/**
 * PackageStoreItemBufferResponse
 */
export class PackageStoreItemBufferResponse {
    name: string;
    extension: string;
    buffer: Buffer;
    
    constructor(name: string, extension: string, buffer: Buffer) {
        this.name = name;
        this.extension = extension.toLowerCase();
        this.buffer = buffer;
    }
}