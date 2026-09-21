const express = require('express');
const router = express.Router();
const {
  getAllPolicies, getPolicyById, getPoliciesByHolder,
  createNewPolicy, updatePolicyStatus, updatePolicy, deletePolicy
} = require('../controllers/policyController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getAllPolicies);
router.get('/holder/:userId', requireAuth, getPoliciesByHolder);
router.get('/:id', requireAuth, getPolicyById);
router.post('/', requireAuth, requireRole('admin', 'underwriter'), createNewPolicy);
router.patch('/:id/status', requireAuth, requireRole('admin', 'underwriter'), updatePolicyStatus);
router.put('/:id', requireAuth, requireRole('admin', 'underwriter'), updatePolicy);
router.delete('/:id', requireAuth, requireRole('admin'), deletePolicy);

module.exports = router;
