// models/Customer.js
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [30, "Name cannot exceed 30 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    date_of_birth: {
      type: Date,
      required: [true,"date is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"]
    },
    refresh_token:{type:String},
    otp: String,
    otp_expires: Date,
    is_otp_verified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
