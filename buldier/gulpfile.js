var gulp = require('gulp'),

	/* Служебные */
	concat      = require('gulp-concat'),		    /* Склейка файлов */
	del         = require('del'),		  		    /* Рекурсивное удаление каталога */
	flatten     = require('gulp-flatten'),		    /* Удаляет относительный путь у файлов */
	newer 		= require('gulp-newer'),		    /* Проверяет, есть ли изменившиеся файлы */
	plumber 	= require('gulp-plumber'),		    /* Заглушка для ошибок в препроцессорных файлах */
	pump 		= require('pump'),				    /* Аналог pipe */
	rename      = require('gulp-rename'),		    /* Переименование файла */
	sequence    = require('gulp-sequence'),		    /* Последовательное выполнение задач */
	server      = require('browser-sync').create(), /* Локальный сервер, live-reload */
	reload      = server.reload;
	batch       = require('gulp-batch'),		    /* Патч для watch */
	watch       = require('gulp-watch'),		    /* Следит за изменениями файлов */
	
	
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
		vendors: {
			all:     '../source/vendors/' , 
			smerk:   '../source/vendors/smerk/'
        },
        src: {
			all:   '../source/'			              ,
			page:  '../source/pages/'			          ,
			less:  '../source/blocks/_service/style.less' ,
			scss:  '../source/blocks/_service/style.scss' ,
			other: '../source/assets/other/'
        },
        pub: {
            all:   '../public/'		,
			style:  '../public/css/'	,
			script: '../public/js/'	,
            img:	'../public/img/'	,
			fonts:  '../public/fonts/'		
			
        }
};

/* ============================== SMERK TASKS ============================== */
/* Сборка smerk стилей */
gulp.task('smerk-less', function(){
	gulp.src(path.vendors.smerk + '_build/smerk.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7'], 
			cascade: true
		}))
		.pipe(postcss([
			mqpacker({sort: true})
		]))
		.pipe(gulp.dest(path.vendors.smerk + '_build'));
});

/* =========================== DEVELOPMENT TASKS =========================== */

/* Сборка разметки */
gulp.task('page', function(){
    gulp.src(path.src.page + '*.pug')
		.pipe(flatten())
		.pipe(plumber())
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(path.pub.all))
        .pipe(server.stream());
});

/* Сборка стилей LESS */
gulp.task('style-less', function(){
	gulp.src(path.src.less)
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
		.pipe(gulp.dest(path.pub.style))
        .pipe(server.stream());
});

/* Сборка стилей SCSS */
gulp.task('style-scss', function(){
	gulp.src(path.src.scss)
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
		.pipe(gulp.dest(path.pub.style))
        .pipe(server.stream());
});

/* Сборка javascript */
gulp.task('script', function(cb){
	pump([
		gulp.src(path.src.all + 'blocks/**/*.js'),
		concat('app.js'),
		gulp.dest(path.pub.script),
		uglify(),
		rename({suffix: '.min'}),
		gulp.dest(path.pub.script),
        server.stream()
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
		.pipe(gulp.dest(path.pub.img))
        .pipe(server.stream());
});

/* Оптимизация изображений */
gulp.task('img', function(){
    gulp.src(path.src.all + '**/img/*.{png,jpg,gif}')
		.pipe(flatten())
		.pipe(newer(path.pub.img))
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
		.pipe(gulp.dest(path.pub.img))
        .pipe(server.stream());
});

/* Сборка шрифтов */
gulp.task('fonts', function(){
    gulp.src(path.src.all + '**/fonts/*.{ttf,eot,svg,woff,woff2}')
		.pipe(flatten())
		.pipe(newer(path.pub.fonts))
		.pipe(gulp.dest(path.pub.fonts))
        .pipe(server.stream());
});

/* Остальные активы */
gulp.task('other', function(){
    gulp.src(path.src.other + '**')
		.pipe(gulp.dest(path.pub.all))
        .pipe(server.stream());
});

/* ============================= SERVICE TASKS ============================= */

/* Наблюдение за изменениями */
gulp.task('watcher', function() {
	watch(path.src.all + '**/*.pug', batch(function (events, done) {
        gulp.start('page', done);
    }));
	
    watch(path.src.all + '**/*.less', batch(function (events, done) {
        gulp.start('style-less', done);
    }));
	
	watch(path.src.all + '**/*.js', batch(function (events, done) {
        gulp.start('script', done);
    }));

	watch(path.src.all + '**/*.{png,jpg,gif}', batch(function (events, done) {
        gulp.start('img', done);
    }));
	
	watch(path.src.all + '**/presvg/*.svg', batch(function (events, done) {
        gulp.start('svg', done);
    }));
	
	watch(path.src.all + '**/fonts/*.{ttf,eot,svg,woff,woff2}', batch(function (events, done) {
        gulp.start('fonts', done)
    }));
	
	watch(path.src.other + '**', batch(function (events, done) {
        gulp.start('other', done);
    }));
	// Для проекта на SCSS
	//watch(path.src.all + '**/*.scss', batch(function (events, done) {
    //    gulp.start('style-scss', done);
    //}));
	//watch(path.src.all + '**/*.less', batch(function (events, done) {
    //    gulp.start('smerk-less', done);
    //}));
	//gulp.watch(path.src.all + '**/*.*').on("change", reload());	
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
gulp.task('prod', sequence('clean', ['page', 'style-less', 'script', 'img', 'svg', 'fonts', 'other']));
gulp.task('dev', sequence('prod', 'server', 'watcher'));