const path = require('path');
const url = require('url');
const express = require('express');

const mncCon = require('../controllers/mnc');

const router = express.Router();


router.get('/',mncCon.get_test);
router.post('/',mncCon.post_test);

module.exports = router;
