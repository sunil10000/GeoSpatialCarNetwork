const path = require('path');
const express = require('express');

const adminCon = require('../controllers/admin');

const router = express.Router();


router.get('/login_page',adminCon.get_test);
router.post('/login_page',adminCon.post_test);

module.exports = router;
