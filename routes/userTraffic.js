const path = require('path');
const url = require('url');
const express = require('express');

const userTrafficCon = require('../controllers/userTraffic');

const router = express.Router();


router.get('/',userTrafficCon.get_test);

module.exports = router;
