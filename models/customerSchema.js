// models/Customer.js
const mongoose = require("mongoose");
const validator = require("validator");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters long"],
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
    refresh_token:{type:String}
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
const bcrypt = require("bcryptjs");

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
