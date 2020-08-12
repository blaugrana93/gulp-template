const { src, dest, watch, series, parallel } = require('gulp');
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const terser = require("gulp-terser");
const sync = require("browser-sync");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const gcmq = require("gulp-group-css-media-queries");
const webp = require("gulp-webp");
const webphtml = require("gulp-webp-html");

function cleanTask() {
  return del('dist/**/*', { force: true })
};

function serverTask() {
  sync.init({
    ui: false,
    notify: false,
    server: { baseDir: "dist", },
    //proxy: "test.loc"
    // port: 8080,
    // online: false, // Work offline without internet connection
  });
};

function htmlTask() {
  return src("src/*.html")
    .pipe(webphtml())
    .pipe(htmlmin({ removeComments: true, collapseWhitespace: true, }))
    //.pipe(replace(`<link rel="stylesheet" href="css/main.css">`, '<link rel="stylesheet" href="css/main.min.css">'))
    .pipe(dest("dist"))
    .pipe(sync.stream());
};

function styleTask() {
  return src("src/scss/main.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gcmq())
    .pipe(dest("dist/css"))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ basename: 'main', suffix: ".min" }))
    .pipe(dest("dist/css"))
    .pipe(sync.stream());
};

function scriptTask() {
  return src([
    //"src/js/jquery-1.11.2.min.js",
    "src/js/main.js"
  ], { sourcemaps: true })
    .pipe(concat("main.js"))
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("dist/js"))
    .pipe(terser())
    .pipe(rename({ basename: 'main', suffix: ".min" }))
    .pipe(dest("dist/js"))
    .pipe(sync.stream());
};

function imageTask() {
  return src("src/img/**/*")
    .pipe(webp({ quality: 70 }))
    .pipe(dest("dist/img"))
    .pipe(src("src/img/**/*"))
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 4 })
    ]))
    .pipe(dest("dist/img"));
};

function staticTask() {
  return src("src/static/*")
    .pipe(dest("dist"))
    .pipe(sync.stream({ once: true }));
};

function fontTask() {
  return src("src/font/**/*")
    .pipe(dest("dist/font"))
    .pipe(sync.stream({ once: true }));
};


function watchTask() {
  watch("src/**/*.html", series(htmlTask));
  watch("src/scss/**/*.scss", series(styleTask));
  watch("src/js/**/*.js", series(scriptTask));
  watch("src/font/**/*", series(fontTask));
  watch("src/static/**/*", series(staticTask));
  watch("src/img/**/*", series(imageTask));
};

exports.cleanTask = cleanTask;
exports.htmlTask = htmlTask;
exports.styleTask = styleTask;
exports.scriptTask = scriptTask;
exports.imageTask = imageTask;
exports.staticTask = staticTask;
exports.fontTask = fontTask;
exports.serverTask = serverTask;
exports.watchTask = watchTask;

exports.build = parallel(htmlTask, styleTask, scriptTask, imageTask, fontTask, staticTask);
exports.default = series(parallel(htmlTask, styleTask, scriptTask, imageTask, fontTask, staticTask), parallel(watchTask, serverTask));