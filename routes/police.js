const path = require('path');
const url = require('url');
const express = require('express');

const policeCon = require('../controllers/police');

const router = express.Router();


router.get('/',policeCon.get_test);
router.post('/',policeCon.post_test);

module.exports = router;
