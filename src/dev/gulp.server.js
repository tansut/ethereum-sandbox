var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');


const deployDir = "";

let tsc = (dest, debug) => {
    var tsProject = ts.createProject('tsconfig.json', {
        watch: false
    });
    var tsResult = tsProject.src();
    if (debug) {
        tsResult = tsResult.pipe(sourcemaps.init())
    }
    tsResult = tsResult.pipe(tsProject());
    if (debug)
        tsResult = tsResult.js.pipe(sourcemaps.write(".", { sourceRoot: "../src/" }));

    tsResult = tsResult.pipe(gulp.dest(dest))
    return tsResult;
}



function cleanBin() {
    return del("bin")
}

let tsh = () => tsc("bin", true)


gulp.task('server.dev', () => {
    let tsh = () => tsc("bin", true)
    return gulp.series(cleanBin, tsh)(function () {
        console.log("SERVER:watching files")
        gulp.watch('./src/**/*.ts', tsh);
    });
})

gulp.task('server.tsc', tsh);

function deployClean() {
    return del([deployDir + "bin"])
}


function deployBin() {
    return tsc(deployDir + "bin", false);
}

 
gulp.task('server.deploy', gulp.series(deployClean, gulp.parallel(deployBin)))