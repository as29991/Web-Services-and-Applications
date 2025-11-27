const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticateToken, isAdmin, isAdminOrAdvanced } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createProductValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').optional().trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('category_id').optional().isInt().withMessage('Invalid category ID'),
    body('brand_id').optional().isInt().withMessage('Invalid brand ID'),
    body('gender_id').optional().isInt().withMessage('Invalid gender ID'),
    body('color_id').optional().isInt().withMessage('Invalid color ID'),
    body('size_id').optional().isInt().withMessage('Invalid size ID'),
    body('image_url').optional().trim()
];

const updateProductValidation = [
    param('id').isInt().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('category_id').optional().isInt().withMessage('Invalid category ID'),
    body('brand_id').optional().isInt().withMessage('Invalid brand ID'),
    body('gender_id').optional().isInt().withMessage('Invalid gender ID'),
    body('color_id').optional().isInt().withMessage('Invalid color ID'),
    body('size_id').optional().isInt().withMessage('Invalid size ID'),
    body('image_url').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

const updateStockValidation = [
    param('id').isInt().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/quantity', productController.getProductQuantity);

router.post('/', authenticateToken, createProductValidation, validate, productController.createProduct);
router.put('/:id', authenticateToken, updateProductValidation, validate, productController.updateProduct);
router.patch('/:id/stock', authenticateToken, isAdminOrAdvanced, updateStockValidation, validate, productController.updateProductStock);
router.delete('/:id', authenticateToken, isAdmin, param('id').isInt().withMessage('Invalid product ID'), validate, productController.deleteProduct);

module.exports = router;
