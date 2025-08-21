const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');
const { roleSchema } = require('../validations/roleValidation');
const validateMiddleware = require('../utils/validate');

const router = express.Router();

router.post('/',validateMiddleware(roleSchema), roleController.createRole);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.put('/:id',validateMiddleware(roleSchema), roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
