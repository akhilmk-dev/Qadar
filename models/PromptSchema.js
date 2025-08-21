const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
    },
    prompt_type:{
        type: String,
        required: [true, "Prompt type is required"],
        trim:true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', 
      required: true,
    },
    response: {
      type: String, // Store as JSON string
      required: true,
      validate: {
        validator: function (value) {
          try {
            JSON.parse(value);
            return true;
          } catch (e) {
            return false;
          }
        },
        message: 'Response must be a valid JSON string',
      },
    },
  },
  { timestamps: true }
);

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;
