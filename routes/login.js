const path = require('path');
const url = require('url');
const express = require('express');

const loginCon = require('../controllers/login');

const router = express.Router();


router.get('/',loginCon.get_test);
router.post('/', loginCon.post_test);

module.exports = router;
