const gulp = require("gulp");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");

var tsProject = ts.createProject({
    declaration: false,
    target: "es5",
    module: "commonjs",
    strict: true,
    alwaysStrict: true,
    types: ["node"],
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
});

var tsProjectLib = ts.createProject({
    declaration: true,
    target: "es5",
    module: "commonjs",
    strict: true,
    alwaysStrict: true,
    types: ["node"],
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
});

gulp.task('build_lib', function() {
    return gulp.src("src/lib/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProjectLib())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: "../../src/lib"}))
        .pipe(gulp.dest("dist/lib"));
});

gulp.task("build_examples", function() {
    return gulp.src("src/examples/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: "../../src/examples"}))
        .pipe(gulp.dest("dist/examples"));
});

gulp.task("copy_examples", function() {
    return gulp.src(["src/examples/**/**", "!src/examples/**/*.ts"])
        .pipe(gulp.dest("dist/examples"));
});

gulp.task("copy_rootfiles", function() {
    return gulp.src(["package.json", ".npmignore", "README.md"])
        .pipe(gulp.dest("dist/"));
});

gulp.task("build", gulp.parallel("build_lib", "build_examples", "copy_examples", "copy_rootfiles"));

gulp.task("default", gulp.series("build"));

//gulp.task('watch', ['scripts'], function() {
//    gulp.watch('src/**/*.ts', ['scripts']);
//});