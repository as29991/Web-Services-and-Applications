const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const clientController = require('../controllers/clientController');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createClientValidation = [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('postal_code').optional().trim(),
    body('country').optional().trim()
];

router.get('/', authenticateToken, clientController.getAllClients);
router.get('/search', authenticateToken, clientController.searchClients);
router.get('/:id', authenticateToken, param('id').isInt(), validate, clientController.getClientById);
router.post('/', authenticateToken, createClientValidation, validate, clientController.createClient);
router.put('/:id', authenticateToken, param('id').isInt(), validate, clientController.updateClient);
router.delete('/:id', authenticateToken, param('id').isInt(), validate, clientController.deleteClient);

module.exports = router;
