var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var zip = require('gulp-zip');

var paths = {
    scriptsApp: ['app/app.*.js', 'app/components/**/*.js'],
    extScripts: ['bower_components/jquery/dist/jquery.min.js', 'node_modules/angular/angular.min.js',
                    'node_modules/angular-ui-router/release/angular-ui-router.min.js', 'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-aria/angular-aria.min.js', 'bower_components/angular-material/angular-material.min.js',
                    'bower_components/lodash/lodash.min.js', 'bower_components/angular-material-icons/angular-material-icons.min.js'],
    scriptsBackground: ['app/background.*.js', 'app/background/**/*.js'],
    scriptsShared: ['app/shared/**/*.js'],
    images: ['assets/img/**/*'],
    css: ['assets/**/*.css'],
    viewsApp: ['app/components/**/*View.html'],
    zippedExtension: ['dist/**']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build'], cb);
});

gulp.task('scriptsApp', ['clean'], function() {
    // Minify and copy all app JavaScript
    // with sourcemaps all the way down
    return gulp.src(paths.scriptsApp)
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('viewsApp', ['clean'], function() {
    // Copy app index
    gulp.src('index.html')
        .pipe(gulp.dest('dist'));
    // Copy all app views
    return gulp.src(paths.viewsApp)
        .pipe(gulp.dest('dist/views'));
});

gulp.task('scriptsBack', ['clean'], function() {
    // Minify and copy all background JavaScript
    // with sourcemaps all the way down
    return gulp.src(paths.scriptsBackground)
        .pipe(sourcemaps.init())
        .pipe(concat('background.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('viewsBack', ['clean'], function() {
    // Copy background index
    return gulp.src('background.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('scriptsShared', ['clean'], function() {
    // Minify and copy all shared JavaScript
    // with sourcemaps all the way down
    return gulp.src(paths.scriptsShared)
        .pipe(sourcemaps.init())
        .pipe(concat('shared.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('images', ['clean'], function() {
    // Copy app icon
    gulp.src('icon.png')
        .pipe(gulp.dest('dist'));
    // Copy all images
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('css', ['clean'], function() {
    // Copy angular material css
    return gulp.src('bower_components/angular-material/angular-material.min.css')
        .pipe(gulp.dest('dist/css'));
    // Copy and concat all css
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'));
});

// Other files (manifest.json)
gulp.task('other', ['clean'], function() {
    gulp.src(paths.extScripts)
        .pipe(gulp.dest('dist/js'));
    // Copy manifest.json
    return gulp.src('manifest.json')
        .pipe(gulp.dest('dist'));
});

// Other files (manifest.json)
gulp.task('zipFiles', ['clean'], function() {
    // Zip all files and create extension
    return gulp.src(paths.zippedExtension)
        .pipe(zip('rentalWatch.zip'))
        .pipe(gulp.dest(''));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scriptsApp, ['scriptsApp']);
    gulp.watch(paths.scriptsBackground, ['scriptsBack']);
    gulp.watch(paths.scriptsShared, ['scriptsShared']);
    gulp.watch(paths.images, ['images']);
    gulp.watch('icon.png', ['images']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.viewsApp, ['viewsApp']);
    gulp.watch('index.html', ['viewsApp']);
    gulp.watch('background.html', ['viewsBack']);
    gulp.watch('manifest.json', ['other']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scriptsApp', 'scriptsBack', 'scriptsShared', 'images', 'css', 'viewsApp', 'viewsBack', 'other', 'zipFiles']);