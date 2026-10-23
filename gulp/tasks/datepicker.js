import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

export const vendorDatepickerJS = () => {
    return gulp.src('./node_modules/air-datepicker/air-datepicker.js')
        .pipe(gulp.dest(`${filePaths.build.js}/vendor/`));
};

export const vendorDatepickerCSS = () => {
    return gulp.src('./node_modules/air-datepicker/air-datepicker.css')
        .pipe(gulp.dest(`${filePaths.build.css}/vendor/`));
};
