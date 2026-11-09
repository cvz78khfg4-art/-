// Задание 1. Версия Node.js и операционная система
const os = require('os');

console.log('Версия Node.js:', process.version);
console.log('Операционная система:', os.type(), os.release(), `(${process.platform})`);
