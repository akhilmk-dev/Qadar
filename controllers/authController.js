// controllers/customerAuthController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");
const catchAsync = require("../utils/catchAsync");
const { InternalServerError, ConflictError } = require("../utils/customErrors");
const Customer = require("../models/customerSchema");
const User = require("../models/userSchema");

// REGISTER customer
exports.customerRegister = catchAsync(async (req, res, next) => {
  const { name, email, password, phone,date_of_birth } = req.body;

  // Check if email already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) throw new ConflictError("Email is already registered");

  const customer = new Customer({ name, email, password, phone ,date_of_birth});
  await customer.save();

  // Generate access and refresh tokens
  const access_token = generateAccessToken(customer);
  const refresh_token = generateRefreshToken(customer);

  // Save refresh token in DB
  customer.refresh_token = refresh_token;
  await customer.save();

  // Return customer details with tokens
  return res.status(201).json({
    status: "success",
    message: "Registration successful",
    access_token,
    refresh_token,
    data: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth
    },
  });
});

// LOGIN customer
exports.customerLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const customer = await Customer.findOne({ email });
  if (!customer) throw new InternalServerError("Invalid credentials");

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) throw new InternalServerError("Invalid credentials");

  const access_token = generateAccessToken(customer);
  const refresh_token = generateRefreshToken(customer);

  customer.refresh_token = refresh_token;
  await customer.save();

  res.json({
    status: "success",
    message: "Login Successful!",
    access_token,
    refresh_token,
    data: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth
    },
  });
});

// REFRESH TOKEN
exports.customerRefreshToken = catchAsync(async (req, res, next) => {
  if (!req.body?.refresh_token) {
    throw new InternalServerError("Refresh token is required");
  }

  const { refresh_token } = req.body;

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer || customer.refresh_token !== refresh_token) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const newAccessToken = generateAccessToken(customer);
    const newRefreshToken = generateRefreshToken(customer);

    customer.refresh_token = newRefreshToken;
    await customer.save();

    res.json({
      status: "success",
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid refresh token" });
  }
});

// LOGOUT
exports.customerLogout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  const customer = await Customer.findOne({ refreshToken });
  if (customer) {
    customer.refresh_token = null;
    await customer.save();
  }

  res.status(204).send();
});


// REGISTER USER
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      status: "error",
      message: "Email is already registered",
    });
  }

  const user = new User({ name, email, password, phone, role });
  await user.save();

  return res.status(201).json({
    status: "success",
    message: "Registration successful, please log in",
  });
});

// LOGIN USER
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Populate role and nested permissions
  const user = await User.findOne({ email })
    .populate({
      path: 'role',
      populate: {
        path: 'permissions',
        select: 'permission_name page_url group _id'
      }
    });

  if (!user) throw new InternalServerError("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new InternalServerError("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_token = refreshToken;
  await user.save();

  const permissions = user.role?.permissions || [];

  res.json({
    status: 'success',
    message: "Login Successfull!",
    accessToken,
    refreshToken,
    user,
    permissions
  });
});

// REFRESH TOKEN
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    throw new InternalServerError("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).populate("role");

    if (!user || user.refresh_token !== refresh_token) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refresh_token = newRefreshToken;
    await user.save();

    res.json({
      status: "success",
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid refresh token" });
  }
});

// LOGOUT USER
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  const user = await User.findOne({ refresh_token: refreshToken });
  if (user) {
    user.refresh_token = null;
    await user.save();
  }
  res.status(204).send();
});