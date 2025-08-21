const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const validateMiddleware = require('../utils/validate');
const { getProfile, changePassword } = require('../controllers/profileController');

const router = express.Router();

router.get('/',authenticate, getProfile);
router.put('/changepassword',authenticate,changePassword)

module.exports = router;
