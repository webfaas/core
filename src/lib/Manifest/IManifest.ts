export interface IManifestMapString{
    [key: string]: string
}

export interface IManifestMapVersion{
    [key: string]: IManifest
}

export interface IManifest {
    "name": string;
    "version"?: string;
    "versions"?: IManifestMapVersion;
    "description"?: string;
    "main"?: string;
    "readme"?: string;
    "readmeFilename"?: string;
    "keywords"?: string[];
    "scripts"?: IManifestMapString;
    "repository"?: IManifestMapString;
    "dependencies"?: IManifestMapString;
    "devDependencies"?: IManifestMapString;
    "engines"?: IManifestMapString;
    "author"?: IManifestMapString;
    "dist"?: IManifestMapString;
    "dist-tags"?: IManifestMapString;
    "publishConfig"?: IManifestMapString;
    "maintainers"?: Array<IManifestMapString>;
    "license"?: string;
    [header: string]: any;
}