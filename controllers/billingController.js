const { readData, findById, findByField, insertRecord, updateRecord } = require('../utils/fileStore');
const { createInvoice, validateInvoice, INVOICE_STATUSES } = require('../models/invoiceModel');

function getAllInvoices(req, res) {
  res.json(readData('invoices.json'));
}

function getInvoiceById(req, res) {
  const invoice = findById('invoices.json', req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(invoice);
}

function getInvoicesByHolder(req, res) {
  res.json(findByField('invoices.json', 'policyholderID', req.params.userId));
}

function getInvoicesByPolicy(req, res) {
  res.json(findByField('invoices.json', 'policyID', req.params.policyId));
}

function createInvoiceRecord(req, res) {
  const errors = validateInvoice(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  const invoice = createInvoice(req.body);
  insertRecord('invoices.json', invoice);
  res.status(201).json(invoice);
}

function updateInvoiceStatus(req, res) {
  const { status } = req.body;
  if (!status || !INVOICE_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${INVOICE_STATUSES.join(', ')}` });
  }
  const existing = findById('invoices.json', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Invoice not found.' });
  const updates = { status };
  if (status === 'Paid') updates.paidDate = new Date().toISOString().split('T')[0];
  res.json(updateRecord('invoices.json', req.params.id, updates));
}

function getBillingSummary(req, res) {
  const invoices = readData('invoices.json');
  res.json({
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    unpaid: invoices.filter(i => i.status === 'Unpaid').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    totalOutstanding: invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
  });
}

module.exports = { getAllInvoices, getInvoiceById, getInvoicesByHolder, getInvoicesByPolicy, createInvoiceRecord, updateInvoiceStatus, getBillingSummary };
