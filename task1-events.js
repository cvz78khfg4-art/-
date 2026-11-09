// Задание 1. События потока чтения: open, data, end
const fs = require('fs');
const path = require('path');

const stream = fs.createReadStream(path.join(__dirname, 'log.txt'), 'utf8');

stream.on('open', () => console.log('Файл открыт'));
stream.on('data', (chunk) => console.log(`Получен чанк: ${chunk.length} символов`));
stream.on('end', () => console.log('Чтение завершено'));
stream.on('error', (err) => console.error('Ошибка:', err.message));
