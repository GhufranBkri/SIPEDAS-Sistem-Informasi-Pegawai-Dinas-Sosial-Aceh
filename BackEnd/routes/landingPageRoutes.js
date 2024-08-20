const express = require('express');
const router = express.Router();
const { visualisasiData } = require('../controllers/landingPageContotroller');

router.get('/visualisasi', visualisasiData);

module.exports = router;
