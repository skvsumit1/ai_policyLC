const { v4: uuidv4 } = require('uuid');

const POLICY_STATUSES = ['Draft', 'Active', 'Lapsed', 'Cancelled', 'Pending_Renewal'];
const PLAN_TYPES = ['PPO', 'HMO', 'EPO', 'TRICARE', 'Medicare_Advantage', 'Medicaid'];

function createPolicy({ policyholderID, planType = 'PPO', annualMaximum = 2000, deductible = 100, premiumAmount = 45.00 }) {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return {
    id: `pol-${uuidv4().slice(0, 8)}`,
    policyNumber: `POL-${year}-${num}`,
    policyholderID,
    status: 'Draft',
    planType,
    annualMaximum,
    deductible,
    deductibleMet: 0,
    premiumAmount,
    premiumFrequency: 'Monthly',
    effectiveDate: null,
    expirationDate: null,
    waitingPeriodEndDate: null,
    coverageTiers: { preventive: 100, basic: 80, major: 50, orthodontic: 0 },
    remainingBenefit: annualMaximum,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function validatePolicy(data) {
  const errors = [];
  if (!data.policyholderID) errors.push('Policyholder ID is required');
  if (data.status && !POLICY_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${POLICY_STATUSES.join(', ')}`);
  }
  if (data.planType && !PLAN_TYPES.includes(data.planType)) {
    errors.push(`Plan type must be one of: ${PLAN_TYPES.join(', ')}`);
  }
  return errors;
}

module.exports = { createPolicy, validatePolicy, POLICY_STATUSES, PLAN_TYPES };
