const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateMiddleware = require('../utils/validate');
const { loginSchema, signupSchema, userLoginSchema, userSignupSchema } = require('../validations/authSchemas');

/// customer Auth
router.post('/customer/login',validateMiddleware(loginSchema), authController.customerLogin);
router.post('/customer/refresh-token', authController.customerRefreshToken);
router.post('/customer/logout',authController.customerLogout);
router.post('/customer/register',validateMiddleware(signupSchema),authController.customerRegister);

// user Auth
router.post('/user/login',validateMiddleware(userLoginSchema), authController.login);
router.post('/user/refresh-token', authController.refreshToken);
router.post('/user/logout',authController.logout);
router.post('/user/register',validateMiddleware(userSignupSchema),authController.register);

module.exports = router;
