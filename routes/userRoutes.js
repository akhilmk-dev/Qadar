const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const validateMiddleware = require('../utils/validate');
const { userSignupSchema, userEditSchema } = require('../validations/authSchemas');
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.post('/',validateMiddleware(userSignupSchema), createUser);
router.get('', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id',validateMiddleware( userEditSchema ), updateUser);
router.delete('/:id',deleteUser);

module.exports = router;
