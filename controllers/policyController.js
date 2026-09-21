const { readData, findById, findByField, insertRecord, updateRecord, deleteRecord } = require('../utils/fileStore');
const { createPolicy, validatePolicy, POLICY_STATUSES } = require('../models/policyModel');

function getAllPolicies(req, res) {
  res.json(readData('policies.json'));
}

function getPolicyById(req, res) {
  const policy = findById('policies.json', req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found.' });
  res.json(policy);
}

function getPoliciesByHolder(req, res) {
  res.json(findByField('policies.json', 'policyholderID', req.params.userId));
}

function createNewPolicy(req, res) {
  const errors = validatePolicy(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  const policy = createPolicy(req.body);
  insertRecord('policies.json', policy);
  res.status(201).json(policy);
}

function updatePolicyStatus(req, res) {
  const { status } = req.body;
  if (!status || !POLICY_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${POLICY_STATUSES.join(', ')}` });
  }
  const existing = findById('policies.json', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Policy not found.' });

  const updates = { status };
  if (status === 'Active' && !existing.effectiveDate) {
    const today = new Date();
    updates.effectiveDate = today.toISOString().split('T')[0];
    const expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + 1);
    updates.expirationDate = expiry.toISOString().split('T')[0];
    const waiting = new Date(today);
    waiting.setMonth(waiting.getMonth() + 3);
    updates.waitingPeriodEndDate = waiting.toISOString().split('T')[0];
  }
  res.json(updateRecord('policies.json', req.params.id, updates));
}

function updatePolicy(req, res) {
  const existing = findById('policies.json', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Policy not found.' });
  res.json(updateRecord('policies.json', req.params.id, req.body));
}

function deletePolicy(req, res) {
  if (!deleteRecord('policies.json', req.params.id)) {
    return res.status(404).json({ error: 'Policy not found.' });
  }
  res.json({ message: 'Policy deleted.' });
}

module.exports = { getAllPolicies, getPolicyById, getPoliciesByHolder, createNewPolicy, updatePolicyStatus, updatePolicy, deletePolicy };
