// Задание 4. Сумма двух чисел из аргументов командной строки
// Запуск: node calc.js 5 3
const a = Number(process.argv[2]);
const b = Number(process.argv[3]);

if (process.argv.length < 4 || Number.isNaN(a) || Number.isNaN(b)) {
  console.log('Использование: node calc.js <число1> <число2>');
  process.exit(1);
}

console.log(`${a} + ${b} = ${a + b}`);
