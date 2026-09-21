const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readData(filename) {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

function findById(filename, id) {
  return readData(filename).find(r => r.id === id) || null;
}

function findByField(filename, field, value) {
  return readData(filename).filter(r => r[field] === value);
}

function insertRecord(filename, record) {
  const records = readData(filename);
  records.push(record);
  writeData(filename, records);
  return record;
}

function updateRecord(filename, id, updates) {
  const records = readData(filename);
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
  writeData(filename, records);
  return records[index];
}

function deleteRecord(filename, id) {
  const records = readData(filename);
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return false;
  records.splice(index, 1);
  writeData(filename, records);
  return true;
}

module.exports = { readData, writeData, findById, findByField, insertRecord, updateRecord, deleteRecord };
