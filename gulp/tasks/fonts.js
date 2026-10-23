import gulp from 'gulp';
import fs from 'fs';
import fonter from 'gulp-fonter-fix';
import ttf2woff2 from 'gulp-ttf2woff2';
import del from 'del';
import { filePaths } from '../config/paths.js';
import { logger } from '../config/logger.js';

const { fontFacesFile } = filePaths.src;
const italicRegex = /italic/i;
const cleanSeparator = /(?:_|__|-|\s)?(italic)/i;

const fontWeights = {
	thin: 100, hairline: 100,
	extralight: 200, ultralight: 200,
	light: 300,
	regular: 400,
	medium: 500,
	semibold: 600, demibold: 600,
	bold: 700,
	extrabold: 800, ultrabold: 800,
	black: 900, heavy: 900,
	extrablack: 950, ultrablack: 950
};

const fontFaceTemplate = (name, file, weight, style) => `@font-face {
	font-family: "${name}";
	font-display: swap;
	src: url("../fonts/${file}.woff2") format("woff2");
	font-weight: ${weight};
	font-style: ${style};
}\n\n`;

const otfToTtf = () => {
	return gulp.src(`${filePaths.src.fonts}/*.otf`, { allowEmpty: true })
		.pipe(logger.handleError('FONTS [otfToTtf]'))
		.pipe(fonter({ formats: ['ttf'] }))
		.pipe(gulp.dest(filePaths.src.fonts));
};

const ttfToWoff = () => {
	return gulp.src(`${filePaths.src.fonts}/*.ttf`, { allowEmpty: true })
		.pipe(logger.handleError('FONTS [ttfToWoff2]'))
		.pipe(ttf2woff2())
		.pipe(gulp.dest(filePaths.src.fonts))
		.pipe(gulp.dest(filePaths.build.fonts));
};

const copyReadyWoff2 = () => {
	return gulp.src(`${filePaths.src.fonts}/*.woff2`, { allowEmpty: true })
		.pipe(logger.handleError('FONTS [copyReadyWoff2]'))
		.pipe(gulp.dest(filePaths.build.fonts));
};

const cleanSrcFonts = () => {
	return del([
		`${filePaths.src.fonts}/*.ttf`,
		`${filePaths.src.fonts}/*.otf`
	]);
};

export { otfToTtf, ttfToWoff, copyReadyWoff2, cleanSrcFonts };
