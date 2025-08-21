const { default: mongoose } = require("mongoose");
const User = require("../models/userSchema");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");
const { NotFoundError, InternalServerError } = require("../utils/customErrors");

exports.getProfile = catchAsync(async (req, res) =>{
    const user = await User.findById(req.user?.id).select('-password -refreshToken -__v').populate({path:"role",select:'-__v -permissions'});
    if(!user){
    throw new NotFoundError("User not found");
  }else{
    return res.status(200).json({status:"success",data:user})
  }
})

exports.changePassword = catchAsync(async (req, res, next) => {
    const { current_password, new_password } = req.body;
    const isValidObjectId = mongoose.Types.ObjectId.isValid;
    if (!isValidObjectId(req?.user?.id))throw new NotFoundError('User not found');
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError("User not found");
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) throw new InternalServerError("Current password is incorrect");
    const isSame = await bcrypt.compare(new_password,user.password);
    if (isSame) throw new InternalServerError("New password is same as existing password");
    user.password = new_password;
    await user.save();
    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
    });
});
