import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const vendorJS = () => {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.js',
    'node_modules/swiper/swiper-bundle.min.js.map',
  ];

  return gulp.src(modules)
    .pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

const vendorCSS = () => {
  const modules = [
    'node_modules/swiper/swiper-bundle.min.css',
  ];

  return gulp.src(modules)
    .pipe(gulp.dest(`${filePaths.build.css}/vendor/`));
};

export { vendorJS, vendorCSS };
