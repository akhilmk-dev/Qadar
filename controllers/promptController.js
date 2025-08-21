const { default: mongoose } = require('mongoose');
const catchAsync = require('../utils/catchAsync'); // adjust path accordingly
const { InternalServerError } = require('../utils/customErrors');
const Prompt = require('../models/PromptSchema');
const s3 = require('../utils/s3');


exports.saveResponse = catchAsync(async (req, res) => {
  const {prompt_type, prompt, response } = req.body;
  const userId = req.user.id;
  const newResponse = new Prompt({prompt_type, prompt, response });
  newResponse.customer = userId;
  const data = await newResponse.save();
  res.status(201).json({ status: 'success', data: data });
});

exports.getImageUrl = catchAsync(async(req,res)=>{
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }
  
    const fileKey = `${Date.now()}-${fileName}`;
  
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 60, 
      ContentType: fileType,
      ACL: 'public-read', 
    };
  
    try {
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      res.status(200).json({ uploadURL, fileKey });
    } catch (err) {
      console.error('Error generating signed URL:', err);
      res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }
})