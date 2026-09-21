const { v4: uuidv4 } = require('uuid');

const INVOICE_STATUSES = ['Unpaid', 'Paid', 'Overdue'];

function createInvoice({ policyID, policyholderID, amount, dueDate, billingPeriod }) {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return {
    id: `inv-${uuidv4().slice(0, 8)}`,
    invoiceNumber: `INV-${year}-${num}`,
    policyID,
    policyholderID,
    amount,
    status: 'Unpaid',
    dueDate,
    paidDate: null,
    billingPeriod,
    createdAt: new Date().toISOString()
  };
}

function validateInvoice(data) {
  const errors = [];
  if (!data.policyID) errors.push('Policy ID is required');
  if (!data.policyholderID) errors.push('Policyholder ID is required');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be a positive number');
  if (!data.dueDate) errors.push('Due date is required');
  if (data.status && !INVOICE_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${INVOICE_STATUSES.join(', ')}`);
  }
  return errors;
}

module.exports = { createInvoice, validateInvoice, INVOICE_STATUSES };
