import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const vendorFancyboxJS = () => {
	const modules = [
		'node_modules/fancybox/dist/js/jquery.fancybox.js',
	];

	return gulp.src(modules)
		.pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

const vendorFancyboxCSS = () => {
	const modules = [
		'node_modules/fancybox/dist/css/jquery.fancybox.css',
	];

	return gulp.src(modules)
		.pipe(gulp.dest(`${filePaths.build.css}/vendor/`));
};

export { vendorFancyboxJS, vendorFancyboxCSS };
