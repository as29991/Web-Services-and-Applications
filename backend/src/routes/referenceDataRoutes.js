const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const refDataController = require('../controllers/referenceDataController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/categories', refDataController.getAllCategories);
router.post('/categories', authenticateToken, isAdmin, body('name').trim().notEmpty().withMessage('Category name is required'), validate, refDataController.createCategory);
router.put('/categories/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.updateCategory);
router.delete('/categories/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.deleteCategory);

router.get('/brands', refDataController.getAllBrands);
router.post('/brands', authenticateToken, isAdmin, body('name').trim().notEmpty().withMessage('Brand name is required'), validate, refDataController.createBrand);
router.put('/brands/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.updateBrand);
router.delete('/brands/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.deleteBrand);

router.get('/colors', refDataController.getAllColors);
router.post('/colors', authenticateToken, isAdmin, body('name').trim().notEmpty().withMessage('Color name is required'), validate, refDataController.createColor);
router.put('/colors/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.updateColor);
router.delete('/colors/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.deleteColor);

router.get('/sizes', refDataController.getAllSizes);
router.post('/sizes', authenticateToken, isAdmin, body('name').trim().notEmpty().withMessage('Size name is required'), validate, refDataController.createSize);
router.put('/sizes/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.updateSize);
router.delete('/sizes/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.deleteSize);

router.get('/genders', refDataController.getAllGenders);
router.post('/genders', authenticateToken, isAdmin, body('name').trim().notEmpty().withMessage('Gender name is required'), validate, refDataController.createGender);
router.put('/genders/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.updateGender);
router.delete('/genders/:id', authenticateToken, isAdmin, param('id').isInt(), validate, refDataController.deleteGender);

module.exports = router;
