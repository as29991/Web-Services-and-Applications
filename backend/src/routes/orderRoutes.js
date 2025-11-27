const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticateToken, isAdminOrAdvanced } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createOrderValidation = [
    body('client_id').isInt().withMessage('Invalid client ID'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product_id').isInt().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shipping_address').notEmpty().withMessage('Shipping address is required'),
    body('notes').optional().trim()
];

const updateStatusValidation = [
    param('id').isInt().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status')
];

router.get('/', authenticateToken, isAdminOrAdvanced, orderController.getAllOrders);
router.get('/:id', authenticateToken, param('id').isInt(), validate, orderController.getOrderById);
router.get('/client/:clientId', authenticateToken, param('clientId').isInt(), validate, orderController.getOrdersByClient);
router.post('/', authenticateToken, createOrderValidation, validate, orderController.createOrder);
router.patch('/:id/status', authenticateToken, isAdminOrAdvanced, updateStatusValidation, validate, orderController.updateOrderStatus);
router.patch('/:id/cancel', authenticateToken, param('id').isInt(), validate, orderController.cancelOrder);

module.exports = router;
