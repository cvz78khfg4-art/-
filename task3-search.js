// Задание 3. Поиск слова в потоке: индекс вхождения и пауза на 3 секунды
// Запуск: node task3-search.js ERROR
const fs = require('fs');
const path = require('path');

const word = process.argv[2] || 'ERROR';
const stream = fs.createReadStream(path.join(__dirname, 'log.txt'), { encoding: 'utf8', highWaterMark: 512 });
let n = 0;

stream.on('data', (chunk) => {
  n++;
  const index = chunk.indexOf(word);
  if (index !== -1) {
    console.log(`Слово «${word}» найдено в чанке №${n}, индекс ${index}. Пауза 3 секунды...`);
    stream.pause();
    setTimeout(() => {
      console.log('Продолжаем чтение');
      stream.resume();
    }, 3000);
  }
});
stream.on('end', () => console.log('Поиск завершён'));
stream.on('error', (err) => console.error('Ошибка:', err.message));
