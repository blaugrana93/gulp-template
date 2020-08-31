const { src, dest, watch, series, parallel } = require('gulp');
const htmlmin = require("gulp-htmlmin");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const terser = require("gulp-terser");
const sync = require("browser-sync");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const gcmq = require("gulp-group-css-media-queries");
const webp = require("gulp-webp");


function serverTask() {
  sync.init({
    ui: false,
    notify: false,
    server: { 
      baseDir: ".", 
    },
    //proxy: "domain.local"
    // port: 8080,
    // online: false, // Work offline without internet connection
  });
};

function htmlTask() {
  return src("index.html")
    .pipe(htmlmin({ removeComments: true, collapseWhitespace: true, }))
    .pipe(rename({ basename: 'index', suffix: ".min" }))
    .pipe(dest("."))
    .pipe(sync.stream());
};

function styleTask() {
  return src("scss/app.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gcmq())
    .pipe(dest("css"))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({ basename: 'app', suffix: ".min" }))
    .pipe(dest("css"))
    .pipe(sync.stream());
};

function scriptTask() {
  return src([
    "js/jquery-1.12.4.min.js",
    "js/app.js"
  ], { sourcemaps: true })
    .pipe(concat("all.js"))
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    //.pipe(dest("js"))
    .pipe(terser())
    .pipe(rename({ basename: 'app', suffix: ".min" }))
    .pipe(dest("js"))
    .pipe(sync.stream());
};

function imageTask() {
  return src("img/webp/*")
    .pipe(webp({ quality: 70 }))
    .pipe(dest("img"));
};

function watchTask() {
  watch("**/index.html", series(htmlTask));
  watch("scss/**/*.scss", series(styleTask));
  watch("js/**/app.js", series(scriptTask));
  watch("img/webp/*", series(imageTask));
};

exports.htmlTask = htmlTask;
exports.styleTask = styleTask;
exports.scriptTask = scriptTask;
exports.imageTask = imageTask;
exports.serverTask = serverTask;
exports.watchTask = watchTask;

exports.build = parallel(htmlTask, styleTask, scriptTask, imageTask);
exports.default = series(parallel(htmlTask, styleTask, scriptTask, imageTask), parallel(watchTask, serverTask));