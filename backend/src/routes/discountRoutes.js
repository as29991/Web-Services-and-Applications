const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const discountController = require('../controllers/discountController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const applyDiscountValidation = [
    body('product_id').isInt().withMessage('Invalid product ID'),
    body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be 0-100'),
    body('discount_amount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be positive'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').isISO8601().withMessage('Invalid end date')
];

router.get('/', discountController.getAllDiscounts);
router.get('/:id', param('id').isInt(), validate, discountController.getDiscountById);
router.get('/product/:productId', param('productId').isInt(), validate, discountController.getProductDiscounts);
router.post('/', authenticateToken, isAdmin, applyDiscountValidation, validate, discountController.applyDiscount);
router.put('/:id', authenticateToken, isAdmin, param('id').isInt(), validate, discountController.updateDiscount);
router.patch('/:id/deactivate', authenticateToken, isAdmin, param('id').isInt(), validate, discountController.deactivateDiscount);
router.delete('/:id', authenticateToken, isAdmin, param('id').isInt(), validate, discountController.deleteDiscount);

module.exports = router;
