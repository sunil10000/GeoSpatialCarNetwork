const path = require('path');
const url = require('url');
const express = require('express');

const allcarsCon = require('../controllers/allcars');

const router = express.Router();


router.get('/',allcarsCon.get_test);

module.exports = router;
