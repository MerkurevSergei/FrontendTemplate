var gulp = require('gulp'),

	/* Служебные */
	del         = require('del'),		  		/* Рекурсивное удаление каталога */
	newer 		= require('gulp-newer'),		/* Проверяет, есть ли изменившиеся файлы */
	plumber 	= require('gulp-plumber'),		/* Заглушка для ошибок в препроцессорных файлах */
	pump 		= require('pump'),				/* Аналог pipe */
	rename      = require('gulp-rename'),		/* Переименование файла */
	sequence = require('gulp-sequence'),		/* Последовательное выполнение задач */
	server = require('browser-sync'),			/* Локальный сервер, live-reload */
	
	/* HTML, CSS, JS */
	pug 		= require('gulp-pug'),			/* Препроцессор HTML */
	sass 		= require('gulp-sass'),			/* Препроцессор CSS */
	less 		= require('gulp-less'),			/* Препроцессор CSS */		
	cssprefixer = require('gulp-autoprefixer'), /* Префиксы при верстке */		
	cssminify   = require('gulp-csso'),			/* Минификация CSS */
	postcss		= require('gulp-postcss'),		/* PostCSS */		
	mqpacker	= require('css-mqpacker'),		/* Упорядочивает медиавыражения */		
	uglify       = require('gulp-uglify'),		/* Минификация JS */
	
	/* Изображения */
	imagemin     = require('gulp-imagemin'),	/* Минификация изображений */
	svgstore     = require('gulp-svgstore'),	/* Сборка спрайтов из SVG */
	svgmin 	     = require('gulp-svgmin');		/* Минификация SVG */

/* ============================== PATH ARRAY =============================== */
var path = {
        src: {
			all:    '../source/'			  ,
			style:  '../source/common/style/' ,
			script: '../source/common/script/',
            fonts:  '../source/assets/fonts/'		
        },
        pub: {
            html:   '../public/'		,
			style:  '../public/style/'	,
			script: '../public/script/'	,
            img:	'../public/img/'	,
			fonts:  '../public/fonts/'		
			
        }
};

/* =========================== DEVELOPMENT TASKS =========================== */

/* Сборка разметки */
gulp.task('page', function(){
    ;
});
/* Сборка стилей LESS*/
gulp.task('style-less', function(){
	gulp.src(path.src.style + 'style.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7'], 
			cascade: true
		}))
		.pipe(postcss([
			mqpacker({sort: true})
		]))
		.pipe(gulp.dest(path.pub.style))
		.pipe(cssminify())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(path.pub.style));
});

/* Сборка стилей SCSS*/
gulp.task('style-scss', function(){
	gulp.src(path.src.style + 'style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7'], 
			cascade: true
		}))
		.pipe(postcss([
			mqpacker({sort: true})
		]))
		.pipe(gulp.dest(path.pub.style))
		.pipe(cssminify())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(path.pub.style));
});

/* Сборка javascript */
gulp.task('script', function(cb){
	pump([
		gulp.src(path.src.script + 'app.js'),
		gulp.dest(path.pub.script),
		uglify(),
		rename({suffix: '.min'}),
		gulp.dest(path.pub.script)
	],
	cb
	);
});

/* Сборка и оптимизация SVG спрайта */
gulp.task('svg', function(){
    gulp.src(path.src.all + '**/presvg/*.svg')
		.pipe(svgmin())
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest(path.pub.img));
});
/* Оптимизация изображений */
gulp.task('img', function(){
    gulp.src(path.src.all + '**/*.{png,jpg,gif}')
		.pipe(newer(path.pub.img))
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
		.pipe(gulp.dest(path.pub.img));
});


/* ============================= SERVICE TASKS ============================= */


/* Наблюдение за изменениями */
gulp.task('watcher', function() {
	gulp.watch(path.src.all + '**/*.less', ['style-less']);
	gulp.watch(path.src.all + '**/*.scss', ['style-scss']);
	gulp.watch(path.src.all + '**/*.js', ['script']);
	gulp.watch(path.src.all + '**/presvg/*.svg', ['svg']);
	gulp.watch(path.src.all + '**/presvg/*.svg', ['svg']);
	gulp.watch(path.src.all + '**/*.*').on("change", server.reload);	
});

/* Локальный сервер */
gulp.task('server', function() {
    server.init({
        server: {
            baseDir: "../public/"
        }
    });
});

/* Очистка public перед сборкой */
gulp.task('clean', function() {
	return del('../public/',{force: true});
});

/* =========================== COLLECTOR PROJECT =========================== */
gulp.task('prod', sequence('clean', ['page', 'style', 'js', 'img', 'svg', 'fonts']));
gulp.task('dev', sequence('prod', 'server', 'watcher'));





