const path = require('path');
const url = require('url');
const express = require('express');

const userCon = require('../controllers/user');

const router = express.Router();


router.get('/',userCon.get_test);
router.post('/',userCon.post_test);

module.exports = router;
