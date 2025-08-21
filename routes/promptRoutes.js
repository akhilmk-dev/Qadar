const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const validateMiddleware = require('../utils/validate');
const { saveResponse, getImageUrl } = require('../controllers/promptController');
const { promptSchema } = require('../validations/promptValidation');

const router = express.Router();

router.post('/save-prompt-response',authenticate,validateMiddleware( promptSchema ), saveResponse);
router.post('/generate-presigned-url',getImageUrl)

module.exports = router;
