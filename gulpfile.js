import gulp from 'gulp';
import browserSync from 'browser-sync';
import { filePaths } from './gulp/config/paths.js';

/**
 * Импорт задач
 */
import { copy } from './gulp/tasks/copy.js';
import { copyRootFiles } from './gulp/tasks/copy-root-files.js';
import { reset } from './gulp/tasks/reset.js';
import { html } from './gulp/tasks/html.js';
import { server } from './gulp/tasks/server.js';
import { scss } from './gulp/tasks/scss.js';
import { javascript } from './gulp/tasks/javascript.js';
import { images } from './gulp/tasks/images.js';
import { otfToTtf, ttfToWoff, copyReadyWoff2, cleanSrcFonts } from './gulp/tasks/fonts.js';
import { createSvgSprite } from './gulp/tasks/create-svg-sprite.js';
import { zip } from './gulp/tasks/zip.js';
import { ftpDeploy } from './gulp/tasks/ftp-deploy.js';
import { vendorJS, vendorCSS } from './gulp/tasks/swiper.js';
import { vendorSimplebarJS, vendorSimplebarCSS } from './gulp/tasks/simplebar.js';
import { vendorGsapJS } from './gulp/tasks/gsap.js';
import { videos } from './gulp/tasks/videos.js';
import { vendorDatepickerJS, vendorDatepickerCSS } from './gulp/tasks/datepicker.js';

const isBuild = process.argv.includes('--build');
const browserSyncInstance = browserSync.create();

const handleServer = server.bind(null, browserSyncInstance);
const handleHTML = html.bind(null, isBuild, browserSyncInstance);
const handleSCSS = scss.bind(null, isBuild, browserSyncInstance);
const handleJS = javascript.bind(null, !isBuild, browserSyncInstance);
const handleImages = images.bind(null, isBuild, browserSyncInstance);
const handleVideos = videos.bind(null, isBuild, browserSyncInstance);

/**
 * Наблюдатель за изменениями в файлах
 */
function watcher() {
	gulp.watch(filePaths.watch.static, copy);
	gulp.watch(filePaths.watch.html, handleHTML);
	gulp.watch(filePaths.watch.scss, handleSCSS);
	gulp.watch(filePaths.watch.js, handleJS);
	gulp.watch(filePaths.watch.images,handleImages);
	gulp.watch(filePaths.watch.videos, handleVideos);
}

/**
 * Последовательная обработка шрифтов
 * */
const fonts = gulp.series(otfToTtf, ttfToWoff, copyReadyWoff2, cleanSrcFonts);

/**
 * Параллельные задачи в режиме разработки
 * */
const devTasks = gulp.parallel(copy, copyRootFiles, createSvgSprite, vendorJS, vendorCSS, handleHTML, handleSCSS, handleJS, handleImages, vendorSimplebarJS, vendorSimplebarCSS, handleVideos, vendorDatepickerJS, vendorDatepickerCSS, vendorGsapJS);

/**
 * Основные задачи
 * */
const mainTasks = gulp.series(fonts, devTasks);

/**
 * Построение сценариев выполнения задач
 * */
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, handleServer));
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
const deployFTP = gulp.series(reset, mainTasks, ftpDeploy);

/**
 * Выполнение сценария по умолчанию
 * */
gulp.task('default', dev);

/**
 * Экспорт сценариев
 * */
export { dev, build, deployZIP, deployFTP, createSvgSprite, vendorJS, vendorCSS };
