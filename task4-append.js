// Задание 4. Поток записи с флагом 'a' — старые данные сохраняются
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'journal.txt');
const stream = fs.createWriteStream(file, { flags: 'a', encoding: 'utf8' });

stream.write(`\n=== ${new Date().toLocaleString('ru-RU')} ===\n`);
stream.write('Первая строка записи\n');
stream.write('Вторая строка записи\n');
stream.write('Третья строка записи\n');
stream.end();

stream.on('finish', () => {
  console.log('Записано. Текущее содержимое файла:');
  console.log(fs.readFileSync(file, 'utf8'));
});
stream.on('error', (err) => console.error('Ошибка:', err.message));
