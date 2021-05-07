const path = require('path');
const url = require('url');
const express = require('express');

const pjCon = require('../controllers/pj');

const router = express.Router();


router.get('/',pjCon.get_test);
router.post('/',pjCon.post_test);

module.exports = router;
