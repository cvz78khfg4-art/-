// ЛР-12. Потоки (Streams) и работа с файлами
// Вариант 1: «Медиа-галерея»
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');

// Задание 2. Известные MIME-типы; всё остальное — application/octet-stream
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404: файл не найден');
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  // Задание 1. «/» -> index.html
  const relative = urlPath === '/' ? 'index.html' : urlPath;

  // Защита от выхода за пределы public (../../)
  const filePath = path.join(PUBLIC, path.normalize(relative));
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Доступ запрещён');
  }

  // Сервер не падает на несуществующем файле
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) return notFound(res);

    let stat;
    try {
      stat = fs.statSync(filePath); // Задание 5. Размер файла
    } catch {
      return notFound(res);
    }
    if (stat.isDirectory()) return notFound(res);

    console.log(`[FILE] ${filePath} — ${stat.size} байт`);

    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size });

    // Задания 3–4. Все файлы (изображения, аудио) отдаются потоком
    const stream = fs.createReadStream(filePath);
    stream.on('error', (e) => {
      console.error('Ошибка потока:', e.message);
      res.destroy();
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => console.log(`Медиа-галерея: http://localhost:${PORT}`));
