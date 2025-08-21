const Joi = require("joi");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const roleSchema = Joi.object({
  role_name: Joi.string()
    .required()
    .min(1)
    .messages({
      "string.base": "Role name must be a string",
      "string.empty": "Role name is required",
      "any.required": "Role name is required",
    }),

  permissions: Joi.array()
    .items(
      Joi.string()
        .pattern(objectIdRegex)
        .messages({
          "string.pattern.base": "Invalid permission ID",
          "string.empty": "Permission ID cannot be empty",
        })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Permissions must be an array",
      "array.min": "At least one permission is required",
      "any.required": "Permissions are required",
    }),
});

module.exports = { roleSchema };
