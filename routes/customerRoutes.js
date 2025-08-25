const express = require("express");
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/authMiddleware");
const validateMiddleware = require("../utils/validate");
const signupSchema = require("../validations/authSchemas");
const { passwordResetSchema, sendOtpSchema, updatePasswordSchema, verifyOtpSchema } = require("../validations/customerValidation");
const router = express.Router();

router.get("/",authenticate, customerController.getAllCustomers);
router.get("/:id",authenticate, customerController.getCustomerById);
router.put("/:id",authenticate,validateMiddleware(signupSchema.updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id",authenticate, customerController.deleteCustomer);
router.post('/reset-password',authenticate,validateMiddleware(passwordResetSchema),customerController.resetPassword);
router.post('/sent-otp',validateMiddleware(sendOtpSchema),customerController.sendPasswordOtp);
router.post('/verify-otp',validateMiddleware(verifyOtpSchema),customerController.verifyOtpOnly);
router.post('/update-password',validateMiddleware(updatePasswordSchema),customerController.resetPasswordAfterOtp);
router.post('/resend-otp',validateMiddleware(sendOtpSchema),customerController.resendOtp);

module.exports = router;
