const { readData, findById, findByField, insertRecord, updateRecord } = require('../utils/fileStore');
const { createClaim, validateClaim, CLAIM_STATUSES } = require('../models/claimModel');

function getAllClaims(req, res) {
  res.json(readData('claims.json'));
}

function getClaimById(req, res) {
  const claim = findById('claims.json', req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found.' });
  res.json(claim);
}

function getClaimsByHolder(req, res) {
  res.json(findByField('claims.json', 'policyholderID', req.params.userId));
}

function getClaimsByPolicy(req, res) {
  res.json(findByField('claims.json', 'policyID', req.params.policyId));
}

function submitClaim(req, res) {
  const errors = validateClaim(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const policy = findById('policies.json', req.body.policyID);
  if (!policy) return res.status(400).json({ error: 'Policy not found.' });
  if (policy.status !== 'Active') {
    return res.status(400).json({
      error: `Cannot submit claim. Policy status is "${policy.status}". Only Active policies are eligible.`
    });
  }

  const claim = createClaim(req.body);
  insertRecord('claims.json', claim);
  res.status(201).json(claim);
}

function adjudicateClaim(req, res) {
  const { status, allowedAmount, denialReason, notes } = req.body;
  const validStatuses = ['Approved', 'Denied', 'Under_Review'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const claim = findById('claims.json', req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found.' });

  const updates = { status, notes: notes ?? claim.notes };

  if (status === 'Approved') {
    const policy = findById('policies.json', claim.policyID);
    const rate = policy ? (policy.coverageTiers[claim.coverageTier] || 80) / 100 : 0.8;
    const allowed = allowedAmount !== undefined ? allowedAmount : claim.chargedAmount;
    updates.allowedAmount = allowed;
    updates.paidAmount = parseFloat((allowed * rate).toFixed(2));
    updates.patientResponsibility = parseFloat((allowed - updates.paidAmount).toFixed(2));
    updates.adjudicatedAt = new Date().toISOString();
  } else if (status === 'Denied') {
    updates.allowedAmount = 0;
    updates.paidAmount = 0;
    updates.patientResponsibility = claim.chargedAmount;
    updates.denialReason = denialReason || 'Claim denied.';
    updates.adjudicatedAt = new Date().toISOString();
  }

  res.json(updateRecord('claims.json', req.params.id, updates));
}

function getClaimsSummary(req, res) {
  const claims = readData('claims.json');
  res.json({
    total: claims.length,
    pending: claims.filter(c => c.status === 'Pending').length,
    under_review: claims.filter(c => c.status === 'Under_Review').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    denied: claims.filter(c => c.status === 'Denied').length,
    totalCharged: claims.reduce((s, c) => s + c.chargedAmount, 0),
    totalPaid: claims.filter(c => c.paidAmount).reduce((s, c) => s + c.paidAmount, 0)
  });
}

module.exports = { getAllClaims, getClaimById, getClaimsByHolder, getClaimsByPolicy, submitClaim, adjudicateClaim, getClaimsSummary };
