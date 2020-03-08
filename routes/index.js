var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.locals.srcLink = 'public/subjs/';
  res.render('index');
});

router.get('/:page', function (req, res) {
  res.locals.srcLink = 'public/subjs/' + req.params.page;
  res.render(req.params.page);
});

module.exports = router;
