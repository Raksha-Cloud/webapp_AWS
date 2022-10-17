const express = require('express');
const router = express.Router();
const accountRoutes = require('./accountRoutes.js');

router.use('/', accountRoutes);
module.exports = router;