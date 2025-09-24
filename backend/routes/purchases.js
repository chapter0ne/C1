const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const purchaseController = require('../controllers/purchaseController');
const router = express.Router();

router.post('/', authMiddleware, purchaseController.createPurchase);
router.get('/my', authMiddleware, purchaseController.getPurchasesByUser);
router.get('/', authMiddleware, adminOnly, purchaseController.getAllPurchases);
router.get('/book/:bookId/count', authMiddleware, adminOnly, purchaseController.getBookPurchaseCount);
router.get('/user/:userId', authMiddleware, purchaseController.checkUserBookPurchase);

module.exports = router; 