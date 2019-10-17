const gulp = require("gulp");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");

var tsProjectLib = ts.createProject({
    declaration: true,
    target: "ES2017",
    module: "commonjs",
    strict: true,
    alwaysStrict: true,
    types: ["node"],
    esModuleInterop: false,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
});

var tsProjectExample = ts.createProject({
    declaration: false,
    target: "ES2017",
    module: "commonjs",
    strict: true,
    alwaysStrict: true,
    types: ["node"],
    esModuleInterop: false,
    experimentalDecorators: false,
    emitDecoratorMetadata: false
});

var tsProjectTest = ts.createProject({
    declaration: false,
    target: "ES2017",
    module: "commonjs",
    strict: true,
    alwaysStrict: true,
    types: ["node"],
    esModuleInterop: false,
    experimentalDecorators: false,
    emitDecoratorMetadata: false
});

gulp.task("compiler:lib", function() {
    return gulp.src("../src/lib/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProjectLib())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: "../../src/lib"}))
        .pipe(gulp.dest("../dist/lib"));
});

gulp.task("compiler:examples", function() {
    return gulp.src("../src/examples/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProjectExample())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: "../../src/examples"}))
        .pipe(gulp.dest("../dist/examples"));
});

gulp.task("compiler:test", function() {
    return gulp.src("../src/test/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProjectTest())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: "../../src/test"}))
        .pipe(gulp.dest("../dist/test"));
});

gulp.task("copy:examples", function() {
    return gulp.src(["../src/examples/**/**", "!../src/examples/**/*.ts"])
        .pipe(gulp.dest("../dist/examples"));
});

gulp.task("copy:test", function() {
    return gulp.src(["../src/test/**/**", "!../src/test/**/*.ts"])
        .pipe(gulp.dest("../dist/test"));
});

gulp.task("copy:rootfiles", function() {
    return gulp.src(["../package.json", "../.npmignore", "../README.md"])
        .pipe(gulp.dest("../dist/"));
});

gulp.task("build", gulp.parallel("compiler:lib", "copy:rootfiles"));

gulp.task("build:test", gulp.parallel("compiler:test", "copy:test"));

gulp.task("build:examples", gulp.parallel("compiler:examples", "copy:examples"));

gulp.task("build:all", gulp.parallel("build", "build:test", "build:examples"));

gulp.task("default", gulp.series("build"));