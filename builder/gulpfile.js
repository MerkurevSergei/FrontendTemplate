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
	server      = require('browser-sync'),          /* Локальный сервер, live-reload */
	reload      = server.reload;	
	
	/* HTML, CSS, JS */
	pug 		= require('gulp-pug'),			/* Препроцессор HTML */
	sass 		= require('gulp-sass'),			/* Препроцессор CSS */
	less 		= require('gulp-less'),			/* Препроцессор CSS */		
	cssprefixer = require('gulp-autoprefixer'), /* Префиксы при верстке */		
	cssminify   = require('gulp-csso'),			/* Минификация CSS */
	postcss		= require('gulp-postcss'),		/* PostCSS */		
	mqpacker	= require('css-mqpacker'),		/* Упорядочивает медиавыражения */		
	uglify      = require('gulp-uglify'),		/* Минификация JS */
    prettify    = require('gulp-prettify'),
	
	/* Изображения */
	imagemin     = require('gulp-imagemin'),	/* Минификация изображений */
	svgstore     = require('gulp-svgstore'),	/* Сборка спрайтов из SVG */
	svgmin 	     = require('gulp-svgmin');		/* Минификация SVG */

/* ============================== PATH ARRAY =============================== */
var path = {
        src: {
			all:    '../source/'			                    ,
			page:   ['../source/pages/*.pug']		            ,
			less:   ['../source/blocks/_service/style.less']    ,
			scss:   ['../source/blocks/_service/style.scss']    ,
            js:     ['../source/blocks/**/*.js']                ,
            img:    ['../source/static/img/**/*.{png,jpg,gif}'] ,
            presvg: ['../source/static/img/presvg/*.svg']       ,
            svg:    ['../source/static/img/*.svg']              ,
            fonts:  ['../source/static/fonts/*.{ttf,eot,svg,woff,woff2}'] ,
			other:  ['../source/static/other/**/*.*']
        },
        pub: {
            all:   '../public/'		  ,
			style:  '../public/css/'  ,
			script: '../public/js/'	  ,
            img:	'../public/img/'  ,
			fonts:  '../public/fonts/'		
			
        }
};

/* =========================== DEVELOPMENT TASKS =========================== */
/* Сборка разметки */
gulp.task('page', function(){
    gulp.src(path.src.page)
		.pipe(flatten())
		.pipe(plumber())
		.pipe(pug({
		}))
        .pipe(prettify({
            indent_size: 4,
            preserve_newlines: true
        }))
		.pipe(gulp.dest(path.pub.all))
        .on('end', reload);
});

/* Сборка стилей LESS */
gulp.task('style-less', function(){
	gulp.src(path.src.less)
		.pipe(plumber())
		.pipe(less())
		.pipe(cssprefixer({
			browsers: ['last 5 versions', '> 1%', 'ie >= 11', 'Chrome >= 21', 'Firefox >= 28', 'Opera >= 12.1', 'Safari >= 6.1', 'iOS >= 7.1' ], 
			cascade: true
		}))
		.pipe(postcss([
			mqpacker({sort: true})
		]))
		.pipe(gulp.dest(path.pub.style))
		.pipe(cssminify())
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest(path.pub.style))
        .pipe(reload({stream: true}));
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
        .pipe(reload({stream: true}));
});

/* Сборка javascript */
gulp.task('script', function(cb){
	pump([
		gulp.src(path.src.js),
		concat('app.js'),
		gulp.dest(path.pub.script),
		uglify(),
		rename({suffix: '.min'}),
		gulp.dest(path.pub.script),
        reload({stream: true})
	],
	cb
	);
    
});

/* Сборка и оптимизация SVG спрайта */
gulp.task('svg', function(){
    gulp.src(path.src.presvg)
        .pipe(plumber())
		.pipe(svgmin())
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest(path.pub.img))
        .on('end', reload);
        
    gulp.src(path.src.svg)
		.pipe(gulp.dest(path.pub.img))
        .on('end', reload);
});

/* Оптимизация изображений */
gulp.task('img', function(){
    gulp.src(path.src.img)
		.pipe(flatten())
		.pipe(newer(path.pub.img))
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
		.pipe(gulp.dest(path.pub.img))
        .on('end', reload);
});

/* Сборка шрифтов */
gulp.task('fonts', function(){
    gulp.src(path.src.fonts)
		.pipe(flatten())
		.pipe(newer(path.pub.fonts))
		.pipe(gulp.dest(path.pub.fonts))
        .on('end', reload);
});

/* Остальные активы */
gulp.task('other', function(){
    gulp.src(path.src.other)
		.pipe(gulp.dest(path.pub.all))
        .on('end', reload);
});

/* ============================= SERVICE TASKS ============================= */

/* Наблюдение за изменениями */
gulp.task('watcher', function() {
    server({server: '../public'});
    gulp.watch(path.src.all + '**/*.pug', ['page']);
	gulp.watch(path.src.all + '**/*.less', ['style-less']);
    gulp.watch(path.src.all + '**/*.js', ['script']);
    gulp.watch(path.src.all + '**/*.{png,jpg,gif}', ['img']);
    gulp.watch(path.src.all + '**/presvg/*.svg', ['svg']);
    gulp.watch(path.src.all + '**/fonts/*.{ttf,eot,svg,woff,woff2}', ['fonts']);
    gulp.watch(path.src.other + '**', ['other']);
	// Для проекта на SCSS
	//watch(path.src.all + '**/*.scss', batch(function (events, done) {
    //    gulp.start('style-scss', done);
    //}));	
});

/* Локальный сервер */
//gulp.task('server', function() {
//    server.init({
//        server: {
//            baseDir: "../public/"
//        }
//    });
//});
 

/* Очистка public перед сборкой */
gulp.task('clean', function() {
	return del('../public/',{force: true});
});

/* =========================== COLLECTOR PROJECT =========================== */
gulp.task('prod', sequence('clean', ['page', 'style-less', 'script', 'img', 'svg', 'fonts', 'other']));
gulp.task('dev', sequence('prod', 'watcher'));