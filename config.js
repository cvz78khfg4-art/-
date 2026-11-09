// Конфигурация: все критичные параметры читаются из .env
require('dotenv').config();

const num = (name, def) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : def;
};

module.exports = {
  limit: num('LIMIT', 500000),
  minAmount: num('MIN_AMOUNT', 1000),
  maxAmount: num('MAX_AMOUNT', 1000000),
  intervalMs: num('INTERVAL_MS', 3000),
  bankName: process.env.BANK_NAME || 'Bank'
};
