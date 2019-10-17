import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";
import { PackageStore } from "../lib/PackageStore/PackageStore";
import { PackageRegistryManager } from "../lib/PackageRegistryManager/PackageRegistryManager";
import { PackageRegistryDiskTarball } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarball";
import { PackageRegistryDiskTarballConfig } from "../lib/PackageRegistry/Registries/DiskTarball/PackageRegistryDiskTarballConfig";

describe("Package Registry Disk", () => {
    var packageRegistryManager_1: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_2: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryManager_3: PackageRegistryManager = new PackageRegistryManager();
    var packageRegistryDiskTarball_1: PackageRegistryDiskTarball;
    var packageRegistryDiskTarball_2: PackageRegistryDiskTarball;
    var packageRegistryDiskTarball_3: PackageRegistryDiskTarball;

    packageRegistryDiskTarball_1 = new PackageRegistryDiskTarball();
    packageRegistryDiskTarball_1.getConfig().base = path.join(__dirname, "./data/data-package");
    packageRegistryManager_1.addRegistry("diskTarball", packageRegistryDiskTarball_1);

    var config_2 = new PackageRegistryDiskTarballConfig();
    config_2.base = path.join(__dirname, "./data/data-package");
    packageRegistryDiskTarball_2 = new PackageRegistryDiskTarball(config_2);
    packageRegistryManager_2.addRegistry("diskTarball", packageRegistryDiskTarball_2);

    var config_3 = new PackageRegistryDiskTarballConfig(path.join(__dirname, "./data/data-package"));
    packageRegistryDiskTarball_3 = new PackageRegistryDiskTarball(config_3);
    packageRegistryManager_3.addRegistry("diskTarball", packageRegistryDiskTarball_3);

    it("should return manifest on call - config1", function(done){
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
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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
                    chai.expect(fileBuffer.toString().substring(0,34)).to.eq("exports = module.exports = SemVer;");
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