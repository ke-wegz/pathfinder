const express = require('express');
const router = express.Router();
const cvController = require('./cv.controller');
const { protect } = require('../../middleware/authenticate');

router.use(protect);

router.get('/', cvController.getCV);
router.post('/generate', cvController.generateCV);
router.put('/', cvController.updateCV);
router.delete('/', cvController.deleteCV);

module.exports = router;
