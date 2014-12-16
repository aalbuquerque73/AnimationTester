var gulp = require('gulp'),
    gutil = require('gulp-util'),
    _ = require('underscore'),
    fs = require('fs'),
    NwBuilder = require('node-webkit-builder'),
    less = require('gulp-less'),
    path = require('path'),
    spawn = require('child_process').spawn,
    node;

var cache = {};

function buildFileList() {
    if (!cache.hasOwnProperty('files')) {
        cache.files = _.map([
            'index.html',
            'package.json',
            'js',
            'css'
        ], function (filename) {
            var file = path.resolve(process.cwd(), filename);
            if (fs.lstatSync(filename).isDirectory()) {
                return file + '/**/**';
            }
            return file;
        });
    }

    return cache.files;
}

function buildOptions(files, platforms) {
    return {
        files: files, // use the glob format
        platforms: platforms,
        buildType: 'versioned ',
        buildDir: './build',
        cacheDir: './cache'
    };
}

gulp.task('default', [], function () {});

// Run project
gulp.task('run', [], function () {
    var files = path.resolve(process.cwd(), './**/**');
    var nw = new NwBuilder(buildOptions(files, ['osx']));

    // Log stuff you want
    nw.on('log', gutil.log);

    // Build returns a promise
    nw.run()
        .then(function () {
            gutil.log('all done!');
        })
        .catch(function (error) {
            console.error(error);
        });
});

gulp.task('build-nw', ['build-win', 'build-osx']);

// Build project
gulp.task('build', ['build-win', 'build-osx', 'build-linux']);

// Compile project
gulp.task('build-osx', [], function () {
    var files = buildFileList();
    var nw = new NwBuilder(buildOptions(files, ['osx']));

    // Log stuff you want
    nw.on('log', gutil.log);

    // Build returns a promise
    nw.build()
        .then(function () {
            gutil.log('all done!');
        })
        .catch(function (error) {
            console.error(error);
        });
});

// Compile project
gulp.task('build-win', [], function () {
    var files = buildFileList();
    var nw = new NwBuilder(buildOptions(files, ['win']));

    // Log stuff you want
    nw.on('log', gutil.log);

    // Build returns a promise
    nw.build()
        .then(function () {
            gutil.log('all done!');
        })
        .catch(function (error) {
            console.error(error);
        });
});

// Compile project
gulp.task('build-linux', ['build-linux32', 'build-linux64']);

// Compile project
gulp.task('build-linux32', [], function () {
    var files = buildFileList();
    var nw = new NwBuilder(buildOptions(files, ['linux32']));

    // Log stuff you want
    nw.on('log', gutil.log);

    // Build returns a promise
    nw.build()
        .then(function () {
            gutil.log('all done!');
        })
        .catch(function (error) {
            console.error(error);
        });
});

// Compile project
gulp.task('build-linux64', [], function () {
    var files = buildFileList();
    var nw = new NwBuilder(buildOptions(files, ['linux64']));

    // Log stuff you want
    nw.on('log', gutil.log);

    // Build returns a promise
    nw.build()
        .then(function () {
            gutil.log('all done!');
        })
        .catch(function (error) {
            console.error(error);
        });
});