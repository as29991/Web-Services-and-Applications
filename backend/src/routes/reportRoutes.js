const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdminOrAdvanced } = require('../middleware/auth');

router.get('/earnings/daily', authenticateToken, isAdminOrAdvanced, reportController.getDailyEarnings);
router.get('/earnings/monthly', authenticateToken, isAdminOrAdvanced, reportController.getMonthlyEarnings);
router.get('/earnings/range', authenticateToken, isAdminOrAdvanced, reportController.getEarningsByDateRange);
router.get('/products/top-selling', authenticateToken, isAdminOrAdvanced, reportController.getTopSellingProducts);
router.get('/sales/category', authenticateToken, isAdminOrAdvanced, reportController.getSalesByCategory);
router.get('/sales/brand', authenticateToken, isAdminOrAdvanced, reportController.getSalesByBrand);
router.get('/products/low-stock', authenticateToken, isAdminOrAdvanced, reportController.getLowStockProducts);
router.get('/revenue/summary', authenticateToken, isAdminOrAdvanced, reportController.getRevenueSummary);

module.exports = router;
