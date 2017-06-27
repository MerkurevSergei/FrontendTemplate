var gulp = require('gulp'),
	rename      = require('gulp-rename'),
	del         = require('del'),
	plumber 	= require('gulp-plumber'),
	
	pug 		= require('gulp-pug'),
	
	sass 		= require('gulp-sass'),
	cssprefixer = require('gulp-autoprefixer'),
	
	browserSync = require('browser-sync');

    //concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    //uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    //cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    //rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
     // Подключаем библиотеку для удаления файлов и папок
    //imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    //pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    //cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    //autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

/* ============================== PATH ARRAY =============================== */
var path = {
		lib: {
			smerk: {
				css:  '../library/smerk/css/',
				sass: '../library/smerk/sass/'
			}
		},
        pub: {
            js: 'static/build/js',
            css: 'static/build/css',
            fonts: 'static/build/fonts',
            img: 'static/build/img'
        },
        src: {
			css:  '../source/css/',
			sass: '../source/sass/',
            vendor_fonts: ['bower_components/**/*.{svg,woff,eot,ttf}', 'semantic/**/*.{svg,woff,eot,ttf}'],
            vendor_img: ['bower_components/**/*.{png,jpg,jpeg,gif}', 'semantic/**/*.{png,jpg,jpeg,gif}']
        }
};

/* =========================== DEVELOPMENT TASKS =========================== */
gulp.task('sass-smerk', function(){
	gulp.src(path.lib.smerk.sass+'**/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7'], 
			cascade: true
		}))
		.pipe(gulp.dest(path.lib.smerk.css));
});

gulp.task('sass-src', function(){
    gulp.src(path.src.sass + 'style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7'], 
			cascade: true
		}))
		.pipe(gulp.dest(path.src.css));
});


gulp.task('watch-dev', function() {
	gulp.watch(path.lib.smerk.sass + '**/*.scss', ['sass-smerk']);
	gulp.watch(path.src.sass + 'style.scss', ['sass-src']);
	
});


/* 

gulp.task('clean', function() {
	del('dist');
})


// Compiling Stylus in CSS | Production
gulp.task('css-build', function() {
    gulp.src('./styl/*.styl')
        .pipe($.newer('./public/css/'))
        .pipe($.stylus({
            use: nib()
        }))
        .pipe(cmq())
        .pipe($.csso())
        .pipe($.autoprefixer('last 3 versions'))
        .pipe(gulp.dest('./public/css/'))
});

// Compiling Stylus in CSS | Develop
gulp.task('css-dev', function() {
    gulp.src('./styl/*.styl')
        .pipe($.newer('./public/css/'))
        .pipe($.sourcemaps.init())
        .pipe(
            $.stylus({
                use: nib()
            })
            .on('error', $.notify.onError({
                title  : "Stylus Error",
                message: "<%= error.message %>",
                sound: "Blow"
            }))
        )
        .pipe($.autoprefixer('last 3 versions'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('./public/css/'))
        .pipe($.livereload())
}); */