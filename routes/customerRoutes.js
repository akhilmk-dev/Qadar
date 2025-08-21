const express = require("express");
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/",authenticate, customerController.createCustomer);
router.get("/",authenticate, customerController.getAllCustomers);
router.get("/:id",authenticate, customerController.getCustomerById);
router.put("/:id",authenticate, customerController.updateCustomer);
router.delete("/:id",authenticate, customerController.deleteCustomer);

module.exports = router;
