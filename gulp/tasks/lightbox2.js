import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const vendorLightbox2JS = () => {
	const modules = [
		'node_modules/lightbox2/dist/js/lightbox.js',
	];

	return gulp.src(modules)
		.pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

const vendorLightbox2CSS = () => {
	const modules = [
		'node_modules/lightbox2/dist/css/lightbox.css',
	];

	return gulp.src(modules)
		.pipe(gulp.dest(`${filePaths.build.css}/vendor/`));
};

export { vendorLightbox2JS, vendorLightbox2CSS };
