const express = require('express');
const router = express.Router();
const {
  getAllClaims, getClaimById, getClaimsByHolder,
  getClaimsByPolicy, submitClaim, adjudicateClaim, getClaimsSummary
} = require('../controllers/claimController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getAllClaims);
router.get('/summary', requireAuth, requireRole('admin', 'underwriter'), getClaimsSummary);
router.get('/holder/:userId', requireAuth, getClaimsByHolder);
router.get('/policy/:policyId', requireAuth, getClaimsByPolicy);
router.get('/:id', requireAuth, getClaimById);
router.post('/', requireAuth, submitClaim);
router.patch('/:id/adjudicate', requireAuth, requireRole('admin', 'underwriter'), adjudicateClaim);

module.exports = router;
