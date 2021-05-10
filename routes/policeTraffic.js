const path = require('path');
const url = require('url');
const express = require('express');

const policeTrafficCon = require('../controllers/policeTraffic');

const router = express.Router();


router.get('/',policeTrafficCon.get_test);

module.exports = router;
