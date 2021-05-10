const path = require('path');
const url = require('url');
const express = require('express');

const mycarsCon = require('../controllers/mycars');

const router = express.Router();


router.get('/',mycarsCon.get_test);

module.exports = router;
