import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const vendorSimplebarJS = () => {
  const modules = [
    'node_modules/simplebar/dist/simplebar.min.js',
  ];

  return gulp.src(modules)
    .pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

const vendorSimplebarCSS = () => {
  const modules = [
    'node_modules/simplebar/dist/simplebar.min.css',
  ];

  return gulp.src(modules)
    .pipe(gulp.dest(`${filePaths.build.css}/vendor/`));
};

export { vendorSimplebarJS, vendorSimplebarCSS };
