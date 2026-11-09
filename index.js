// Точка входа: подключаем обработчики и запускаем генератор
const { bankName, limit, intervalMs } = require('./config');
require('./monitor');
const generator = require('./generator');

console.log(`${bankName}: мониторинг запущен. Лимит ${limit.toLocaleString('ru-RU')} ₸, интервал ${intervalMs / 1000} с`);
generator.start();
