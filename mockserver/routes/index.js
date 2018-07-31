var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mock server' });
});
var desktop = require('../desktop.json')
var mobile = require('../mobile.json')
router.get('/banners', function(req, res, next) {
  if(req.query.device === "desktop"){
    res.send(desktop)
  } else if (req.query.device === "mobile") {
    res.send(mobile)
  }
});

module.exports = router;
