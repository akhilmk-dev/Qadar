const { default: mongoose } = require('mongoose');
const catchAsync = require('../utils/catchAsync'); // adjust path accordingly
const { InternalServerError } = require('../utils/customErrors');
const Prompt = require('../models/promptSchema');


exports.saveResponse = catchAsync(async (req, res) => {
  const {prompt_type, prompt, response } = req.body;
  const userId = req.user.id;
  const newResponse = new Prompt({prompt_type, prompt, response });
  newResponse.customer = userId;
  const data = await newResponse.save();
  res.status(201).json({ status: 'success', data: data });
});
