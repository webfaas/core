import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryNPM } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPM";
import { PackageRegistryNPMConfig } from "../lib/PackageRegistry/Registries/NPM/PackageRegistryNPMConfig";

import { Log } from "../lib/Log/Log";
import { LogLevelEnum } from "../lib/Log/ILog";
import { ClientHTTPConfig } from "../lib/ClientHTTP/ClientHTTPConfig";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry NPM", () => {
    var packageRegistryManager_1: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_2: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_3: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryNPM_1: PackageRegistryNPM;
    var packageRegistryNPM_2: PackageRegistryNPM;
    var packageRegistryNPM_3: PackageRegistryNPM;

    packageRegistryNPM_1 = new PackageRegistryNPM(undefined, log);
    chai.expect(packageRegistryNPM_1.getTypeName()).to.eq("NPM");
    packageRegistryManager_1.addRegistry("npm", packageRegistryNPM_1);
    
    var config_1 = new PackageRegistryNPMConfig("url1", new ClientHTTPConfig(), "token1");
    chai.expect(config_1.url).to.eq("url1");
    chai.expect(config_1.token).to.eq("token1");
    chai.expect(config_1.httpConfig).to.be.an.instanceof(Object);

    var config_2 = new PackageRegistryNPMConfig();
    config_2.url = "https://registry.npmjs.org";
    packageRegistryNPM_2 = new PackageRegistryNPM(config_2, log);
    packageRegistryManager_2.addRegistry("npm", packageRegistryNPM_2);

    var config_3 = new PackageRegistryNPMConfig("https://registry.npmjs.org");
    packageRegistryNPM_3 = new PackageRegistryNPM(config_3, log);
    packageRegistryManager_3.addRegistry("npm", packageRegistryNPM_3);

    it("should return manifest on call - config1", function(done){
        chai.expect(packageRegistryNPM_1.getConfig()).to.be.an.instanceof(Object);

        packageRegistryManager_1.getPackageStore("semver").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);
                
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
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
        packageRegistryManager_1.getPackageStore("semver").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);

                packageRegistryManager_1.getPackageStore("semver", undefined, packageStore.getEtag()).then(function(packageStore_etag){
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
        packageRegistryManager_2.getPackageStore("semver").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
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
        packageRegistryManager_3.getPackageStore("semver").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
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
        packageRegistryManager_1.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
                    chai.expect(manifest.version).to.eq("5.6.0");
                    chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - etag - config1", function(done){
        packageRegistryManager_1.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                chai.expect(packageStore.getEtag().length > 1).to.eq(true);

                packageRegistryManager_1.getPackageStore("semver", "5.6.0", packageStore.getEtag()).then(function(packageStore_etag){
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
        packageRegistryManager_2.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
                    chai.expect(manifest.version).to.eq("5.6.0");
                    chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return package item on call - config3", function(done){
        packageRegistryManager_3.getPackageStore("semver", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.an.instanceof(Object);
            if (packageStore){
                var manifest = packageStore.getManifest();
                chai.expect(manifest).to.be.an.instanceof(Object);
                if (manifest){
                    chai.expect(manifest.name).to.eq("semver");
                    chai.expect(manifest.version).to.eq("5.6.0");
                    chai.expect(manifest.description).to.eq("The semantic version parser used by npm.");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }

                var fileBuffer = packageStore.getItemBuffer("semver.js");
                chai.expect(typeof(fileBuffer)).to.eq("object");
                if (fileBuffer){
                    chai.expect(fileBuffer.buffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
                }
            }

            done();
        }).catch(function(error){
            done(error);
        })
    })

    it("should return null package item on call", function(done){
        packageRegistryManager_1.getPackageStore("notfound***", "5.6.0").then(function(packageStore){
            chai.expect(packageStore).to.be.null;

            done();
        }).catch(function(error){
            done(error);
        })
    })
})