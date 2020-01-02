import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryGitHubTarballV3 } from "../lib/PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3";
import {PackageRegistryGitHubTarballV3Config } from "../lib/PackageRegistry/Registries/GitHubTarballV3/PackageRegistryGitHubTarballV3Config";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { ClientHTTPConfig } from "../lib/ClientHTTP/ClientHTTPConfig";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry GitHubTarballV3", () => {
    var packageRegistryManager_1: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_2: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_3: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryGitHubTarballV3_1: PackageRegistryGitHubTarballV3;
    var packageRegistryGitHubTarballV3_2: PackageRegistryGitHubTarballV3;
    var packageRegistryGitHubTarballV3_3: PackageRegistryGitHubTarballV3;

    packageRegistryGitHubTarballV3_1 = new PackageRegistryGitHubTarballV3(undefined, log);
    chai.expect(packageRegistryGitHubTarballV3_1.getTypeName()).to.eq("GitHubTarballV3");
    packageRegistryManager_1.addRegistry("GitHubTarballV3", packageRegistryGitHubTarballV3_1);
    
    var config_1 = new PackageRegistryGitHubTarballV3Config("url1", new ClientHTTPConfig(), "token1");
    chai.expect(config_1.url).to.eq("url1");
    chai.expect(config_1.token).to.eq("token1");
    chai.expect(config_1.httpConfig).to.be.an.instanceof(Object);

    var config_2 = new PackageRegistryGitHubTarballV3Config();
    config_2.url = "https://api.github.com";
    packageRegistryGitHubTarballV3_2 = new PackageRegistryGitHubTarballV3(config_2, log);
    packageRegistryManager_2.addRegistry("GitHubTarballV3", packageRegistryGitHubTarballV3_2);

    var config_3 = new PackageRegistryGitHubTarballV3Config("https://api.github.com");
    packageRegistryGitHubTarballV3_3 = new PackageRegistryGitHubTarballV3(config_3, log);
    packageRegistryManager_3.addRegistry("GitHubTarballV3", packageRegistryGitHubTarballV3_3);

    it("should return manifest on call - config1", function(done){
        chai.expect(packageRegistryGitHubTarballV3_1.getConfig()).to.be.an.instanceof(Object);

        packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);
                
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq(undefined);
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return manifest on call - etag - config1", function(done){
        packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);

                packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum", undefined, packageStore.getEtag()).then(function(packageStore_etag){
                    chai.expect(packageStore_etag).to.be.null;
                    
                    done();
                }).catch(function(error){
                    done(error);
                })
            }
            else{
                done();
            }
        }).catch(function(error){
            done(error);
        })
    })

    it("should return manifest on call - config2", function(done){
        packageRegistryManager_2.getPackageStore("@webfaaslabs/mathsum").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq(undefined);
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return manifest on call - config3", function(done){
        packageRegistryManager_3.getPackageStore("@webfaaslabs/mathsum").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq(undefined);
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return null manifest on call", function(done){
        packageRegistryManager_1.getPackageStore("notfound***").then(function(packageStore){
            chai.expect(packageStore).to.be.null;

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - config1", function(done){
        packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("sum x + y");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y") > -1).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - etag - config1", function(done){
        packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);

                packageRegistryManager_1.getPackageStore("@webfaaslabs/mathsum", "0.0.1", packageStore.getEtag()).then(function(packageStore_etag){
                    chai.expect(packageStore_etag).to.be.null;
                    
                    done();
                }).catch(function(error){
                    done(error);
                })
            }
            else{
                done();
            }
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - config2", function(done){
        packageRegistryManager_2.getPackageStore("@webfaaslabs/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("sum x + y");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("@webfaaslabs/mathsum.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y") > -1).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - config3", function(done){
        packageRegistryManager_3.getPackageStore("@webfaaslabs/mathsum", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("@webfaaslabs/mathsum");
                    chai.expect(manifest.version).to.eq("0.0.1");
                    chai.expect(manifest.description).to.eq("sum x + y");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("@webfaaslabs/mathsum.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().indexOf("return x + y") > -1).to.eq(true);
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return null package item on call", function(done){
        packageRegistryManager_1.getPackageStore("notfound***", "0.0.1").then(function(packageStore){
            chai.expect(packageStore).to.be.null;

            done();
        }).catch(function(error){
            done(error);
        })
    })
})