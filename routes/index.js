var express = require('express');
var router = express.Router();

const MAIN_TITLE = "A CODER'S VIEW";

const subjs = [
  { url: "subj-anim-curve", title: "Reverse-engineer animation curve" },
  { url: "subj-transparent-color", title: "Transparent color matters" },
  { url: "subj-frame-sync", title: "Frame synchronization issues" },
  { url: "subj-skdlq-linkage", title: "《思考的乐趣》复现7. 连杆系统" },
  { url: "subj-skdlq-buffon", title: "《思考的乐趣》复现6. 蒲丰投针实验" },
  { url: "subj-skdlq-cwidth", title: "《思考的乐趣》复现5. 定宽曲线" },
  { url: "subj-skdlq-mandelbrot", title: "《思考的乐趣》复现4. Mandelbrot集" },
  { url: "subj-skdlq-eulerline", title: "《思考的乐趣》复现3. 欧拉线" },
  { url: "subj-skdlq-ekg", title: "《思考的乐趣》复现2. 心电图数列" },
  { url: "subj-skdlq-golden", title: "《思考的乐趣》复现1. 黄金分割" },
  { url: "subj-fib", title: "Fibonacci number" },
  { url: "subj-oblique-text", title: "斜着看的文字" },
  { url: "subj-persp-vs-ortho", title: "Perspective vs. orthographic" },
  { url: "subj-ndc", title: "NDC curve" },
  { url: "subj-fov-and-zoom", title: "FOV and zoom" },
  { url: "subj-fov-and-speed", title: "FOV and speed" },
  { url: "subj-quaternions", title: "Quaternion" },
];

function find_title(page) {
  for (let subj of subjs) {
    if (subj.url == page) {
      return subj.title;
    }
  }
  return "";
}

/* GET home page. */
router.get('/', function (req, res) {
  res.locals.head_title = MAIN_TITLE;
  res.locals.subjs = subjs;
  res.render('index');
});

router.get('/:page', function (req, res) {
  res.locals.subj_title = find_title(req.params.page);
  res.locals.head_title = res.locals.subj_title + " - " + MAIN_TITLE;
  res.locals.srcLink = 'public/subjs/' + req.params.page;
  res.locals.backLink = '/';
  res.locals.dir = res.locals.srcLink;
  res.render(req.params.page);
});

module.exports = router;
