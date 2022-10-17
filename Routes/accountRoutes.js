const express = require('express');
const router = express.Router();
const accountController = require('../Controller/controller.js');

router.post('/v1/account', accountController.addAccount);
 router.get('/v1/account/:id', accountController.findAccountById);
// router.put('/:id', accountController.updateGig);


module.exports = router;