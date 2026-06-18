const { v4: uuidv4 } = require('uuid');

function generateId() {
  return uuidv4();
}

function generateInvoiceNumber() {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${timestamp}${random}`;
}

module.exports = {
  generateId,
  generateInvoiceNumber
};
