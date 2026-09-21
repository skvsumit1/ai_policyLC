const express = require('express');
const router = express.Router();
const {
  getAllInvoices, getInvoiceById, getInvoicesByHolder,
  getInvoicesByPolicy, createInvoiceRecord, updateInvoiceStatus, getBillingSummary
} = require('../controllers/billingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getAllInvoices);
router.get('/summary', requireAuth, requireRole('admin', 'underwriter'), getBillingSummary);
router.get('/holder/:userId', requireAuth, getInvoicesByHolder);
router.get('/policy/:policyId', requireAuth, getInvoicesByPolicy);
router.get('/:id', requireAuth, getInvoiceById);
router.post('/', requireAuth, requireRole('admin', 'underwriter'), createInvoiceRecord);
router.patch('/:id/status', requireAuth, updateInvoiceStatus);

module.exports = router;
