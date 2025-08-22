const { default: mongoose } = require('mongoose');
const catchAsync = require('../utils/catchAsync'); // adjust path accordingly
const { InternalServerError } = require('../utils/customErrors');
const Prompt = require('../models/PromptSchema');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


exports.getImageUrl = catchAsync(async (req, res) => {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType are required' });
  }

  const fileKey = `${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
   
  });

  try {
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 6000 }); 
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    res.status(200).json({
      uploadURL,
      fileKey,
      publicUrl,
    });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    res.status(500).json({ error: 'Failed to generate pre-signed URL' });
  }
});

exports.saveResponse = catchAsync(async (req, res) => {
  const {prompt_type, prompt, response } = req.body;
  const userId = req.user.id;
  const newResponse = new Prompt({prompt_type, prompt, response });
  newResponse.customer = userId;
  const data = await newResponse.save();
  res.status(201).json({ status: 'success', data: data });
});


