// Модуль-генератор: раз в N секунд создаёт перевод и решает, какое событие выбросить
const bus = require('./bus');
const { limit, minAmount, maxAmount, intervalMs } = require('./config');

function randomAmount() {
  return Math.floor(minAmount + Math.random() * (maxAmount - minAmount));
}

function start() {
  return setInterval(() => {
    const amount = randomAmount();
    if (amount > limit) bus.emit('fraud-alert', amount);
    else bus.emit('transfer', amount);
  }, intervalMs);
}

module.exports = { start };
