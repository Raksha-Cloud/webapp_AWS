const express = require('express');
const router = express.Router();
const accountController = require('../Controller/controller.js');
const fileController = require('../Controller/fileController.js');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/uploads/' });
//routes for accounts endpoints
router.post('/v2/account', accountController.addAccount);
router.get('/v1/account/:id', accountController.findAccountById);
router.put('/v1/account/:id', accountController.updateAccount);

router.get('/v1/verifyUser', accountController.verifyEmail);


//routes for document endpoints
router.post('/v1/document', upload.single('file'), fileController.uploadDoc);
router.get('/v1/document', fileController.getAllDoc);
router.get('/v1/document/:id', fileController.getDoc);
router.delete('/v1/document/:id', fileController.deleteDoc);



module.exports = router;