// ЛР-6. Работа с JSON-файлами
// Вариант 1: «Система управления библиотекой»
const fs = require('fs/promises');
const path = require('path');

const FILE = path.join(__dirname, 'books.json');

async function readBooks() {
  const text = await fs.readFile(FILE, 'utf8');
  return JSON.parse(text);
}

async function writeBooks(books) {
  await fs.writeFile(FILE, JSON.stringify(books, null, 2), 'utf8');
}

// Задание 1. Инициализация: создать books.json с [], если его нет
async function init() {
  try {
    await fs.access(FILE);
    console.log('books.json уже существует');
  } catch {
    try {
      await writeBooks([]);
      console.log('Создан books.json с пустым массивом');
    } catch (err) {
      console.error('Ошибка инициализации:', err.message);
    }
  }
}

// Задание 2. Добавление книги с новым id
async function addBook(title, author, year) {
  try {
    const books = await readBooks();
    const id = books.length ? Math.max(...books.map((b) => b.id)) + 1 : 1;
    const book = { id, title, author, year, isIssued: false };
    books.push(book);
    await writeBooks(books);
    console.log('Добавлена книга:', book);
    return book;
  } catch (err) {
    console.error('Ошибка добавления:', err.message);
  }
}

// Задание 3. Поиск книг по автору
async function findBooksByAuthor(author) {
  try {
    const books = await readBooks();
    const found = books.filter((b) => b.author.toLowerCase() === author.toLowerCase());
    console.log(`Книги автора «${author}»: ${found.length}`);
    found.forEach((b) => console.log(` - [${b.id}] ${b.title} (${b.year})`));
    return found;
  } catch (err) {
    console.error('Ошибка поиска:', err.message);
  }
}

// Задание 4. Выдача книги: isIssued = true
async function issueBook(id) {
  try {
    const books = await readBooks();
    const book = books.find((b) => b.id === id);
    if (!book) {
      console.log(`Книга с id ${id} не найдена`);
      return;
    }
    book.isIssued = true;
    await writeBooks(books);
    console.log(`Книга «${book.title}» выдана`);
  } catch (err) {
    console.error('Ошибка выдачи:', err.message);
  }
}

// Задание 5. Удаление книг старше 50 лет
async function deleteOldBooks(currentYear) {
  try {
    const books = await readBooks();
    const kept = books.filter((b) => currentYear - b.year <= 50);
    await writeBooks(kept);
    console.log(`Удалено старых книг: ${books.length - kept.length}`);
  } catch (err) {
    console.error('Ошибка удаления:', err.message);
  }
}

async function main() {
  console.log('--- Задание 1 ---');
  await init();
  console.log('--- Задание 2 ---');
  await addBook('JavaScript для начинающих', 'Иван Петров', 2023);
  await addBook('Чистый код', 'Роберт Мартин', 2008);
  await addBook('Мастер и Маргарита', 'Михаил Булгаков', 1967);
  await addBook('Идеальный программист', 'Роберт Мартин', 2011);
  console.log('--- Задание 3 ---');
  await findBooksByAuthor('Роберт Мартин');
  console.log('--- Задание 4 ---');
  await issueBook(2);
  console.log('--- Задание 5 ---');
  await deleteOldBooks(new Date().getFullYear());
  console.log('Итог:', await readBooks());
}

main();
