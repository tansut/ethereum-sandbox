var gulp = require('gulp');

var gulpserver = require('./src/dev/gulp.server');


gulp.task('dev', gulp.parallel("server.dev"))