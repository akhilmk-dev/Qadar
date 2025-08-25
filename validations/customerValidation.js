const Joi = require("joi");

const passwordResetSchema = Joi.object({
    current_password: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    new_password: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required',
    }),
  });

  const verifyOtpSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
  
    otp: Joi.string()
      .length(5) // because you use 5-digit OTPs
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be 5 digits',
        'string.pattern.base': 'OTP must be numeric',
        'any.required': 'OTP is required',
      }),
  });

  const updatePasswordSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
  
    new_password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'New password is required',
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'New password is required',
      }),
  });
  
  const sendOtpSchema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
  });
  

  module.exports= {sendOtpSchema, passwordResetSchema, verifyOtpSchema, updatePasswordSchema}