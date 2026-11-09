// Задание 5: цветной вывод с пакетом chalk@4
// Перед запуском: npm install
const chalk = require('chalk');

console.log(chalk.green('Программа запущена'));
console.log(chalk.yellow(`Платформа: ${process.platform}`));
console.log(chalk.red.bold('Программа завершена'));
