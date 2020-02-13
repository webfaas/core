const sonarqubeScanner = require("sonarqube-scanner");
const path = require("path");

sonarqubeScanner({
    serverUrl: "http://localhost:9000",
    options : {
        "sonar.sources": path.join(__dirname, "../src/lib"),
        "sonar.inclusions" : "**",
        "sonar.typescript.lcov.reportPaths": path.join(__dirname, "../coverage/lcov.info"),
    }
}, () => {});

//console.log(path.join(__dirname, "../coverage/lcov.info"));