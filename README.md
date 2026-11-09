# ПМ4 Node.js — РО4.1, лабораторные работы 1–12 (Вариант 1)

Студент: **Стариков Юрий**, группа **15 ТИС**

Нужен Node.js 18+ (`node -v`). Каждая ЛР — отдельная папка. Все команды выполняются **из папки ЛР**.

| ЛР | Тема | Папка |
|---|---|---|
| 1 | Введение в Node.js | `ЛР-01-Введение` |
| 2 | Модули | `ЛР-02-Модули` |
| 3 | Модуль path, `__dirname` | `ЛР-03-path` |
| 4 | fs — синхронно («Система управления инвентарем») | `ЛР-04-fs-sync` |
| 5 | fs — асинхронно («Асинхронный архиватор логов») | `ЛР-05-fs-async` |
| 6 | JSON-файлы («Система управления библиотекой») | `ЛР-06-json` |
| 7 | Потоки («Логирование и фильтрация») | `ЛР-07-stream` |
| 8 | NPM («Организация рабочего окружения») | `ЛР-08-npm` |
| 9 | Конфигурация и EventEmitter («Мониторинг банковских транзакций») | `ЛР-09-EventEmitter` |
| 10 | Модуль HTTP («Информационный узел системы») | `ЛР-10-HTTP` |
| 11 | REST API («Учёт оборудования») | `ЛР-11-REST-API` |
| 12 | Потоки и файлы («Медиа-галерея») | `ЛР-12-Streams-Media` |

---

## ЛР-1. Введение в Node.js
```bash
node info.js          # версия Node.js и ОС
node hello.js Юрий    # Привет, Юрий!   (без имени — Привет, Незнакомец!)
node timer.js         # Запуск... → через 2 с Готово!
node calc.js 5 3      # 5 + 3 = 8
node counter.js       # 1…5 с интервалом 1 с, затем process.exit()
```

## ЛР-2. Модули
- `greet.js`, `math.js`, `validator.js` — свои модули (`module.exports`), подключаются в `index.js`
  (`math` — через деструктуризацию).
- Задание 3 — встроенный модуль `os` (платформа, имя компьютера, домашняя папка, ОЗУ в ГБ).
```bash
node index.js         # задания 1–4
npm install           # установит chalk@4 (задание 5)
node colors.js        # зелёный / жёлтый / красный жирный текст
```

## ЛР-3. Модуль path
```bash
node task1/index.js               # __dirname, __filename, basename/extname/dirname
node task2/index.js               # путь к data/info.txt + path.parse()
node task3/index.js report.txt    # абсолютный путь files/report.txt
node task4/index.js               # расширения и пути в uploads
node task5/src/index.js           # путь ../config/app.json из src
```

## ЛР-4. fs — синхронные методы
```bash
node index.js
```
Создаёт `data/inventory.txt`, читает его, дописывает товары флагом `'a'`, создаёт `categories.txt`
и `suppliers.txt`, выводит список файлов, удаляет `temp_log.txt` и переименовывает
`inventory.txt` → `inventory_final.txt`. Все операции в `try...catch`, пути — через `path.join(__dirname, …)`.

## ЛР-5. fs.promises — асинхронно
```bash
node index.js
```
`setup()` → `storage/status.txt`; чтение `tasks.txt` в верхнем регистре; `addLog()` с меткой времени
в `storage/activity.log`; цепочка `source.txt` → `copy.txt` → удаление оригинала;
параллельная проверка файлов через `Promise.all` + `fs.access`.
Для повторного запуска верните файл `source.txt` (он удаляется в задании 4).

## ЛР-6. JSON-файлы
```bash
node library.js
```
`init()` создаёт `books.json` с `[]`; `addBook()`, `findBooksByAuthor()`, `issueBook(id)`,
`deleteOldBooks(currentYear)` удаляет книги старше 50 лет. Перед повторным запуском удалите
`books.json`, чтобы книги не добавлялись второй раз.

## ЛР-7. Потоки
```bash
node task1-events.js          # события open / data / end
node task2-buffer.js          # highWaterMark 512 байт, количество чанков
node task3-search.js ERROR    # индекс слова в чанке и пауза 3 с
node task4-append.js          # поток записи с флагом 'a' (журнал journal.txt)
node task5-pipe.js            # копирование pipe() одной строкой, «Готово»
```

## ЛР-8. NPM
Папка `lab-npm-1` уже содержит результат: версия `0.1.0`, зависимость `uuid`, devDependency `nodemon`,
скрипты `start` и `dev`. Порядок выполнения для отчёта:
```bash
mkdir lab-npm-1 && cd lab-npm-1
npm init -y                       # быстрая инициализация
npm version 0.1.0 --no-git-tag-version
npm install uuid                  # основная зависимость
npm install -D nodemon            # зависимость для разработки
npm start                         # Сгенерированный ID: …
npm run dev                       # измените текст в app.js — nodemon перезапустит
rm -rf node_modules && npm start  # ошибка: Cannot find module 'uuid'
npm install                       # восстановление по package.json
```

## ЛР-9. dotenv + EventEmitter
```bash
npm install
npm run dev     # nodemon следит за .js и .env
```
Параметры (`LIMIT`, `INTERVAL_MS`, диапазон сумм, имя банка) — в `.env`. Модули общаются через общую
шину `src/bus.js` (EventEmitter): `generator.js` раз в 3 с выбрасывает `transfer` или `fraud-alert`,
`monitor.js` выводит «Успешный перевод…» или «[ALARM] Подозрительная активность…».

## ЛР-10. Модуль HTTP
```bash
node server.js
curl -i http://localhost:3000/          # 200 Server Alpha is active
curl -i http://localhost:3000/status    # «Система готова к работе» (charset=utf-8)
curl -i http://localhost:3000/admin     # 403 Доступ ограничен
curl -i http://localhost:3000/html      # <h1>Инфо-панель</h1>, text/html
```
В консоли сервера — метод и User-Agent каждого запроса.

## ЛР-11. REST API
```bash
node server.js
curl http://localhost:3000/devices
curl "http://localhost:3000/devices?status=work"
curl -i -X POST http://localhost:3000/devices -H "Content-Type: application/json" -d '{"name":"Принтер","status":"repair"}'   # 201
curl -i -X POST http://localhost:3000/devices -H "Content-Type: application/json" -d '{"status":"work"}'                       # 400
```
Готовые запросы для VS Code (REST Client) — `requests.http`. В консоли: `[ADD]: Добавлено устройство Принтер`.

## ЛР-12. Медиа-галерея на потоках
```bash
node server.js     # открыть http://localhost:3000
```
`index.html` + `style.css` из `public`, галерея из 3 изображений и mp3-плеер — всё отдаётся через
`createReadStream().pipe(res)`. Неизвестные расширения (`.zip`) → `application/octet-stream`,
несуществующий файл → 404 без падения сервера, выход за пределы `public` (`../`) запрещён.
В консоли — путь и размер каждого файла (`fs.statSync`).

---

Все программы проверены запуском (Node.js 22): вывод совпадает с заданием, серверы проверены через `curl`.
