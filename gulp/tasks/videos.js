import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

export function videos(isBuild, browserSyncInstance) {
  return gulp.src(filePaths.src.videos)
    .pipe(gulp.dest(filePaths.build.videos))
    .pipe(browserSyncInstance.stream()); // Для обновления в браузере при изменениях
}
