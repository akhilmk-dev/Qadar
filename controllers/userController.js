const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const catchAsync = require("../utils/catchAsync");
const { InternalServerError, NotFoundError, ForbiddenError } = require("../utils/customErrors");
  
// CREATE USER
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ status: "error", message: "Email already exists" });
  }

  const user = new User({ name, email, password, phone, role });
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: user,
  });
});

// GET ALL USERS (with pagination)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  let { page = 0, limit = 10, sortBy, search } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  // Build search query
  const query = {};
  if (search) {
      query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
      ];
  }

  // Sorting
  let sort = {};
  if (sortBy) {
      const [field, order] = sortBy.split(":");
      sort[field] = order === "desc" ? -1 : 1;
  } else {
      sort = { createdAt: -1 }; // default: newest first
  }

  // Pagination
  const skip = (page) * limit;

  const [users, total] = await Promise.all([
      User.find(query)
          .select("-password -refreshToken -__v -updatedAt")
          .populate({ path: "role", select: "role_name _id" })
          .sort(sort)
          .skip(skip)
          .limit(limit),
      User.countDocuments(query)
  ]);

  res.status(200).json({
      status: "success",
      results: users.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: users
  });
});

// GET SINGLE USER BY ID
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("role");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    status: "success",
    data: user,
  });
});

// UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Update fields
  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.phone = phone ?? user.phone;
  user.role = role ?? user.role;

  await user.save();

  res.json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
});

// DELETE USER
exports.deleteUser = catchAsync(async (req, res, next) => {
  const userExist = await User.findById(req.params.id)?.populate('role');
  if( userExist?.role.role_name?.toLowerCase()=="admin"){
    throw new ForbiddenError("Can't delete Admin user");
  }else{
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
  
    res.json({
      status: "success",
      message: "User deleted successfully",
      data:user
    });
  }
 
});
