import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const vendorGsapJS = () => {
	const modules = [
		'node_modules/gsap/dist/gsap.min.js',
		'node_modules/gsap/dist/MotionPathPlugin.min.js',
	];

	return gulp.src(modules)
		.pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

export { vendorGsapJS };
