var gulp = require('gulp');
var plugins = require('gulp-load-plugins')(); // tous les plugins de package.json
var source = './';
var destination = './dist/';

// Preprocesseur sass + autoprefixer
gulp.task('css', function () {
  return gulp.src('sass/timeline.scss')
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(gulp.dest("src"));
});

gulp.task('watch', function () {
  // gulp.watch('./sass/**/*.scss', ['css']);
  gulp.watch('./js/**/*.js', ['scripts']);
});

gulp.task('scripts', function() {
  return gulp.src('./js/*.js')
    .pipe(plugins.concat('timeline.js'))
    .pipe(gulp.dest('./src/'));
});

gulp.task("minify", function(){
	gulp.src('src/*.js').pipe(plugins.minify({
        ext:{
            // src:'-debug.js',
            min:'-min.js'
        },
        ignoreFiles: ["*-min.js"] 
    })).pipe(gulp.dest('src/'))
});

