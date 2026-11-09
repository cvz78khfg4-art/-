// Модуль-обработчик: подписывается на события и выводит сообщения
const bus = require('./bus');

const fmt = (n) => n.toLocaleString('ru-RU') + ' ₸';

bus.on('transfer', (amount) => {
  console.log(`Успешный перевод: ${fmt(amount)}`);
});

bus.on('fraud-alert', (amount) => {
  console.log(`[ALARM] Подозрительная активность: ${fmt(amount)}!`);
});
