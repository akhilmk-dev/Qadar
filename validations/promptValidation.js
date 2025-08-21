const Joi = require('joi');

// Prompt validation schema
const promptSchema = Joi.object({
  prompt: Joi.string().required().messages({
    "string.base": "Prompt must be a string",
    "string.empty": "Prompt is required",
    "any.required": "Prompt is required",
  }),
  prompt_type: Joi.string().required().messages({
    "string.base": "Prompt type must be a string",
    "string.empty": "Prompt type is required",
    "any.required": "Prompt type is required",
  }),
  response: Joi.string().custom((value, helpers) => {
    try {
      JSON.parse(value);
      return value;
    } catch (err) {
      return helpers.error("any.invalid");
    }
  }, "JSON string validation").required().messages({
    "string.base": "Response must be a string",
    "string.empty": "Response is required",
    "any.required": "Response is required",
    "any.invalid": "Response must be a valid JSON string",
  }),
});

module.exports = {
  promptSchema
};
