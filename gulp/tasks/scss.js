import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import cleanCss from 'gulp-clean-css';
// import webpCss from 'gulp-webpcss';
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import postcssGroupMedia from 'postcss-sort-media-queries';
import sourcemaps from "gulp-sourcemaps";

import { filePaths } from '../config/paths.js';
import { plugins } from '../config/plugins.js';
import { logger } from "../config/logger.js";

const sass = gulpSass(dartSass);

const scss = (isBuild, serverInstance) => {
	const webpConfig = {
		webpClass: '.webp',
		noWebpClass: '.no-webp',
	};

	return gulp.src(filePaths.src.scss)
    	.pipe(logger.handleError('SCSS'))
		.pipe(plugins.if(!isBuild, sourcemaps.init()))
		.pipe(sass({ outputStyle: 'expanded' }, null))
		.pipe(plugins.replace(/@img\//g, '../images/'))

		// .pipe(plugins.if(isBuild, webpCss(webpConfig))) // чтобы добавлять в css .webp .element
		.pipe(plugins.if(true, postcss([
			autoprefixer({
				grid: false
			}),
			postcssPresetEnv(),
			postcssGroupMedia({ sort: 'desktop-first' })
		])))

		.pipe(gulp.dest(filePaths.build.css)) // Сначала сохраняем несжатый оригинал
		.pipe(plugins.if(isBuild, cleanCss())) // Затем этот же поток сжимаем
		.pipe(rename({ extname: '.css' }))
		.pipe(plugins.if(!isBuild, sourcemaps.write('.')))
		.pipe(gulp.dest(filePaths.build.css))
		.pipe(serverInstance.stream());
};

export { scss };
