// Задание 5. Копирование файла через pipe — одной строкой
const fs = require('fs');
const path = require('path');

const reader = fs.createReadStream(path.join(__dirname, 'log.txt'));
const writer = fs.createWriteStream(path.join(__dirname, 'log-copy.txt'));

reader.pipe(writer).on('finish', () => console.log('Готово'));
