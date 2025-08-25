const express = require("express");
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/authMiddleware");
const validateMiddleware = require("../utils/validate");
const signupSchema = require("../validations/authSchemas");

const router = express.Router();

router.get("/",authenticate, customerController.getAllCustomers);
router.get("/:id",authenticate, customerController.getCustomerById);
router.put("/:id",authenticate,validateMiddleware(signupSchema.updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id",authenticate, customerController.deleteCustomer);
router.post('/reset-password',authenticate,customerController.resetPassword);

module.exports = router;
