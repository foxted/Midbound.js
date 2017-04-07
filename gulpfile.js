var gulp = require('gulp');
var minify = require('gulp-minify');

var paths = {
    scripts: ['src/midbound.js']
};

gulp.task('scripts', function() {
    gulp.src(paths.scripts)
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['scripts']);