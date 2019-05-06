export enum PackageRegistryResponseFormatEnum {
    MANIFEST_UNCOMPRESSED = "MANIFEST_UNCOMPRESSED",
    BUNDLE_TAR_UNCOMPRESSED = "BUNDLE_TAR_UNCOMPRESSED",
    BUNDLE_TAR_COMPRESSED = "BUNDLE_TAR_COMPRESSED",
}

export interface IPackageRegistryResponse {
    etag: string
    format: string
    data: Buffer | null
}