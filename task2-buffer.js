// Задание 2. Размер чанка 512 байт (highWaterMark) и подсчёт чанков
const fs = require('fs');
const path = require('path');

let chunks = 0;
const stream = fs.createReadStream(path.join(__dirname, 'log.txt'), { highWaterMark: 512 });

stream.on('data', (chunk) => {
  chunks++;
  console.log(`Чанк №${chunks}: ${chunk.length} байт`);
});
stream.on('end', () => console.log(`Всего чанков: ${chunks}`));
stream.on('error', (err) => console.error('Ошибка:', err.message));
