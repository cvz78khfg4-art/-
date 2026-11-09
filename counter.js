// Задание 5. Числа от 1 до 5 с интервалом в 1 секунду
let n = 1;

const timer = setInterval(() => {
  console.log(n);
  if (n === 5) {
    clearInterval(timer);
    process.exit(0); // завершаем программу после вывода 5
  }
  n++;
}, 1000);
