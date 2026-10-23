import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
// import webpHtml from 'gulp-webp-html-nosvg'; необходим для оборачивания картинок в picture
import versionNumber from 'gulp-version-number';
import htmlMin from 'gulp-htmlmin';
import { v4 as uuidv4 } from 'uuid';

import { plugins } from '../config/plugins.js';
import { filePaths } from '../config/paths.js';
import { logger } from "../config/logger.js";
import { load } from 'cheerio'; //  для безопасной обработки HTML-структур

// Глобальный счётчик для уникальных ID в рамках одной сборки
let cardCounter = 0;

// Функция генерации уникального ID
function generateUniqueId(baseId) {
  cardCounter++;
  return `${baseId}-${uuidv4().slice(0, 8)}`; // Например: product-radio-a1b2c3d4
}

const html = (isBuild, serverInstance) => {
  return gulp.src(filePaths.src.html)
    .pipe(logger.handleError('HTML'))
    .pipe(fileInclude())
    .pipe(plugins.replace(/@img\//g, 'images/'))

    // Обработка id/for внутри каждого родительского контейнера (div, li, section и т.д.)
    .pipe(plugins.replace(/[\s\S]*/, (htmlContent) => {
      const $ = load(htmlContent, { decodeEntities: false });

      // ИЩЕМ ВСЕ ЭЛЕМЕНТЫ С КЛАССОМ wrapper-input И С АТРИБУТОМ data-block="favorite-wrapper"
      $('.wrapper-input, [data-block="favorite-wrapper"]').each((i, wrapperEl) => {
        const $wrapper = $(wrapperEl);

        // Ищем любой input (и radio, и checkbox) и label внутри этого контейнера
        const $input = $wrapper.find('input');
        const $label = $wrapper.find('label');

        // Проверяем, что найден ровно один input и один label
        if ($input.length === 1 && $label.length === 1) {
          const type = $input.attr('type') || 'input';
          const groupName = $input.attr('name') || type;
          const uniqueId = `${groupName}-${uuidv4().slice(0, 6)}`;

          $input.attr('id', uniqueId);
          $label.attr('for', uniqueId);
        }
      });

      // ВОЗВРАЩАЕМ ОБРАБОТАННЫЙ ВЕСЬ HTML
      return $.html();
    }))
    .pipe(
      htmlMin({
        useShortDoctype: true,
        sortClassName: true,
        removeComments: isBuild,

        /** Раскомментировать если требуется минификация html */
        //collapseWhitespace: isBuild,
      })
    )
    .pipe(
      plugins.replace(
        /(id\s*=\s*["'])([^"']*)(["']\s*for\s*=\s*["'])([^"']*)(["'])/g,
        (match, p1, idValue, p3, forValue, p5) => {
          // Проверяем: id и for совпадают — это пара
          if (idValue === forValue && idValue.trim() !== '') {
            const newId = generateUniqueId(idValue);
            return `${p1}${newId}${p5} ${p3}${newId}${p5}`;
          }
          return match; // Не трогаем, если не пара
        }
      )
    )
    .pipe(
      plugins.if(
        isBuild,
        versionNumber({
          value: '%DT%',

          append: {
            key: '_v',
            cover: 0,
            to: ['css', 'js'],
          },

          output: {
            file: 'gulp/version.json',
          },
        })
      )
    )
    .pipe(gulp.dest(filePaths.buildFolder))
    .pipe(serverInstance.stream());
};

export { html };
