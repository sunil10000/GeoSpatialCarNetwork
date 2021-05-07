const path = require('path');
const url = require('url');
const express = require('express');

const trafficCon = require('../controllers/traffic');

const router = express.Router();


router.get('/',trafficCon.get_test);
router.post('/',trafficCon.post_test);

module.exports = router;
