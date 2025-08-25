const Customer = require("../models/customerSchema");
const catchAsync = require("../utils/catchAsync");
const { InternalServerError, NotFoundError, ForbiddenError } = require("../utils/customErrors");
const bcrypt = require("bcryptjs");


// =====================
// CREATE CUSTOMER
// =====================
exports.createCustomer = catchAsync(async (req, res, next) => {
  const { name, email, password, phone,date_of_birth } = req.body;

  const existing = await Customer.findOne({ email });
  if (existing) {
    return res.status(409).json({ status: "error", message: "Email already exists" });
  }

  const customer = new Customer({ name, email, password, phone, date_of_birth });
  await customer.save();

  res.status(201).json({
    status: "success",
    message: "Customer created successfully",
    data: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth,
      createdAt: customer.createdAt
    }
  });
});

// =====================
// GET ALL CUSTOMERS (pagination, search, sort)
// =====================
exports.getAllCustomers = catchAsync(async (req, res, next) => {
  let { page = 0, limit = 10, sortBy, search } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  let sort = {};
  if (sortBy) {
    const [field, order] = sortBy.split(":");
    sort[field] = order === "desc" ? -1 : 1;
  } else {
    sort = { createdAt: -1 };
  }

  const skip = page * limit;

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .select("-password -refresh_token -__v -updatedAt")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(query)
  ]);

  res.status(200).json({
    status: "success",
    results: customers.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: customers
  });
});

// =====================
// GET SINGLE CUSTOMER BY ID
// =====================
exports.getCustomerById = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id).select("-password -refresh_token -__v");
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  res.json({
    status: "success",
    data: customer,
  });
});

// =====================
// UPDATE CUSTOMER
// =====================
exports.updateCustomer = catchAsync(async (req, res, next) => {
  const { name, email, phone, date_of_birth } = req.body;

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  customer.name = name ?? customer.name;
  customer.email = email ?? customer.email;
  customer.phone = phone ?? customer.phone;
  customer.date_of_birth = date_of_birth ?? customer.date_of_birth

  await customer.save();

  res.json({
    status: "success",
    message: "Customer updated successfully",
    data: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth,
      createdAt: customer.createdAt
    }
  });
});

// =====================
// DELETE CUSTOMER
// =====================
exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  res.json({
    status: "success",
    message: "Customer deleted successfully",
    data: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
    }
  });
});

// =====================
// RESET PASSWORD
// =====================

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password } = req.body;

  const customer = await Customer.findById(req.user.id);
  if (!customer)throw new NotFoundError("Customer not found")

  const isMatch = await bcrypt.compare(current_password, customer.password);
  if (!isMatch) throw new InternalServerError("Current password is invalid")
  customer.password = new_password;
  await customer.save(); 

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});