const path = require('path');
const url = require('url');
const express = require('express');

const rbCon = require('../controllers/rb');

const router = express.Router();


router.get('/',rbCon.get_test);
router.post('/',rbCon.post_test);

module.exports = router;
