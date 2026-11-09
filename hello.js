// Задание 2. Приветствие по имени из аргумента командной строки
// Запуск: node hello.js Юрий
const name = process.argv[2];

if (name) {
  console.log(`Привет, ${name}!`);
} else {
  console.log('Привет, Незнакомец!');
}
