const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createUserValidation = [
    body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be 3-100 characters'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'advanced_user', 'simple_user']).withMessage('Invalid role')
];

const resetPasswordValidation = [
    param('id').isInt().withMessage('Invalid user ID'),
    body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/roles', authenticateToken, userController.getAllRoles);
router.get('/:id', authenticateToken, isAdmin, param('id').isInt(), validate, userController.getUserById);
router.post('/', authenticateToken, isAdmin, createUserValidation, validate, userController.createUser);
router.put('/:id', authenticateToken, isAdmin, param('id').isInt(), validate, userController.updateUser);
router.patch('/:id/reset-password', authenticateToken, isAdmin, resetPasswordValidation, validate, userController.resetUserPassword);
router.patch('/:id/toggle-status', authenticateToken, isAdmin, param('id').isInt(), validate, userController.toggleUserStatus);
router.delete('/:id', authenticateToken, isAdmin, param('id').isInt(), validate, userController.deleteUser);

module.exports = router;
