var gulp = require('gulp'),
    sass = require('gulp-sass');
    minifycss = require('gulp-minify-css');

gulp.task('scss', function () {
    gulp.src('scss/index.scss')
        .pipe(sass())
        .pipe(minifycss())
        .pipe(gulp.dest('./public/stylesheets'));
});
gulp.task('watch', function () {
    gulp.watch('scss/*.scss', ['scss']);
});
