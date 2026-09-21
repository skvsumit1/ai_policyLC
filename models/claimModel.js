const { v4: uuidv4 } = require('uuid');

const CLAIM_STATUSES = ['Pending', 'Under_Review', 'Adjudicated', 'Approved', 'Denied'];
const COVERAGE_TIERS = ['preventive', 'basic', 'major', 'orthodontic'];

function createClaim({ policyID, policyholderID, providerName, providerNPI, serviceDate, cdtCode, description, chargedAmount, coverageTier, cptCode = null, icd10Code = null }) {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return {
    id: `clm-${uuidv4().slice(0, 8)}`,
    claimNumber: `CLM-${year}-${num}`,
    policyID,
    policyholderID,
    providerName,
    providerNPI,
    serviceDate,
    cdtCode,
    cptCode,
    icd10Code,
    description,
    chargedAmount,
    allowedAmount: null,
    paidAmount: null,
    patientResponsibility: null,
    coverageTier,
    status: 'Pending',
    denialReason: null,
    notes: '',
    submittedAt: new Date().toISOString(),
    adjudicatedAt: null,
    createdAt: new Date().toISOString()
  };
}

function validateClaim(data) {
  const errors = [];
  if (!data.policyID) errors.push('Policy ID is required');
  if (!data.policyholderID) errors.push('Policyholder ID is required');
  if (!data.cdtCode) errors.push('CDT code is required');
  if (!data.chargedAmount || data.chargedAmount <= 0) errors.push('Charged amount must be positive');
  if (!data.serviceDate) errors.push('Service date is required');
  if (data.status && !CLAIM_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${CLAIM_STATUSES.join(', ')}`);
  }
  if (data.coverageTier && !COVERAGE_TIERS.includes(data.coverageTier)) {
    errors.push(`Coverage tier must be one of: ${COVERAGE_TIERS.join(', ')}`);
  }
  return errors;
}

module.exports = { createClaim, validateClaim, CLAIM_STATUSES, COVERAGE_TIERS };
