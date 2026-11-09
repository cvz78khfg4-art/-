// ЛР-8. Генерация случайного ID с помощью пакета uuid
const { v4: uuidv4 } = require('uuid');

console.log('Сгенерированный ID:', uuidv4());
