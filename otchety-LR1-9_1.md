# Материалы для отчётов по ЛР-1 … ЛР-9

Скриншоты, результаты запусков и данные вашего сервера (IP, URL Render, commit hash) вставляете сами — в тексте ниже они отмечены как **[скриншот]** / **[вставить]**.

---

## ЛР-1. Основы тестирования серверных приложений

**Цель:** освоить базовые принципы автоматического тестирования backend: выделить бизнес-логику, написать позитивные, негативные и граничные unit tests на `node:test` + `node:assert/strict`.

**Что сделано:** `services/orderMath.js` (`calculateOrderTotal`, `canCancelOrder`), `tests/node-test/orderMath.test.js` — 18 tests (positive, negative, boundary, самостоятельное задание). Запуск: `npm run test:node` (в лабораторной — `npm test`; после ЛР-2 `npm test` запускает Jest).
Проверено: 18 pass, 0 fail.

**Эксперимент с failing test:** временно заменить ожидание `25000` → `25001`, запустить, найти в выводе `actual`/`expected` (`25000 !== 25001`), вернуть значение. **[скриншот падения и зелёного прогона]**

**Классификация tests**

| Test | Уровень | Причина |
| --- | --- | --- |
| `calculateOrderTotal()` | Unit | чистая функция |
| `canCancelOrder()` | Unit | нет HTTP, Prisma и БД |
| `POST /api/orders` | пока не реализован | будет integration test |

**Unit / integration / E2E**
- **Unit** — проверяет одну функцию/модуль изолированно, без сети и БД; быстрый, детерминированный.
- **Integration** — проверяет взаимодействие компонентов: HTTP → Express → middleware → Service → Prisma → тестовая PostgreSQL.
- **E2E** — проверяет сценарий целиком «как пользователь» через реальный клиент (браузер/frontend) и развёрнутую систему; самый медленный и хрупкий.

**Вывод:** написаны и запущены unit tests; тесты фиксируют контракт функций, умеют падать и детерминированы.

---

## ЛР-2. Модульное тестирование с Jest

**Цель:** настроить Jest в ESM-проекте, писать unit tests с matchers, hooks, `jest.fn()` и изолировать Product Service от Prisma через dependency injection.

**Что сделано:** `jest.config.js` (ESM: `transform: {}`, `clearMocks: true`), script `test` через `--experimental-vm-modules`; `services/productService.js` (`createProductService(repository)` с `getById/create/update/delete`); `tests/unit/orderMath.test.js`, `tests/unit/productService.test.js`; `test.each()` для boundary values; метод `delete(id)` с positive/negative tests, `toHaveBeenCalledWith`, `not.toHaveBeenCalled`.

**Зачем dependency injection и mock functions**
- DI: Service получает repository аргументом, поэтому в production ему можно передать Prisma repository, а в тесте — подделку. Service не знает про Prisma/PostgreSQL → тесты быстрые и не требуют БД.
- `jest.fn()` заменяет зависимость, позволяет задать ответ (`mockResolvedValue`, `mockResolvedValueOnce`) и проверить взаимодействие (аргументы, число вызовов, отсутствие вызова).

**Роль `beforeEach()` и `clearMocks: true`:** перед каждым test создаётся новый mock / сбрасывается история вызовов, поэтому состояние не «протекает» между tests (см. группу `mock isolation`).

**Вывод:** бизнес-логика Service проверяется без PostgreSQL; проверены результаты, ошибки, аргументы и число вызовов зависимостей.

---

## ЛР-3. Интеграционное тестирование REST API

**Цель:** настроить integration tests на Jest + Supertest, отделить `app` от `app.listen()`, проверить status/body/headers, protected endpoints и test database.

**Что сделано:** `app.js` (экспортирует `app`), `server.js` (запуск); `tests/integration/products.api.test.js`; `tests/helpers.js` (очистка БД с учётом внешних ключей, создание пользователей, login через реальный `/api/auth/login`); `.env.test.example`; отдельная БД `shop_test`.

**Покрытие:** GET collection (в т.ч. пустая БД), GET by id, `Content-Type`, 404, invalid id → 400, POST без token → 401, invalid JWT → 401, user → 403, admin POST → 201 + проверка записи через Prisma, validation → 400, PATCH, PATCH unknown → 404, DELETE + проверка отсутствия записи, DELETE unknown → 404.

**Как подготовить БД (один раз):**
```sql
CREATE USER shop_test WITH PASSWORD 'college123' CREATEDB;  -- или свой пользователь
CREATE DATABASE shop_test OWNER shop_test;
```
```powershell
Copy-Item .env.test.example .env.test
$env:DATABASE_URL="postgresql://shop_test:college123@localhost:5432/shop_test"
npx prisma migrate deploy
npm test
```

**Unit vs integration vs E2E:** см. ЛР-1. Здесь тесты — integration: реальный Express app через `request(app)` (без открытия порта) и реальная тестовая БД, но без браузера/frontend.

**Вывод:** API проверено через HTTP на реальной тестовой БД; изоляция обеспечена очисткой данных перед каждым test (`--runInBand`).

---

## ЛР-4. Отладка и логирование

**Цель:** научиться локализовать ошибки (debugger, stack trace), внедрить structured logging (Pino), request ID и безопасную обработку ошибок.

**Что сделано:** `config/logger.js` (уровни, `redact`, pretty только в development); `middleware/requestContext.js` (X-Request-Id + child logger); `middleware/requestLogger.js` (method/path/status/duration); `middleware/errorHandler.js` (stack только в server log, клиенту — безопасное сообщение + `requestId`); логи в `requireAuth` (`missing_authorization` и др., без самого token), warn при 403, error при 500; domain context `productId`; regression test (`tests/integration/products.api.test.js` — `regression: GET /api/products/:id ...`).

**Упражнения, которые нужно выполнить вручную** (пп. 8–15, 17–18, 20–21):
1. `npm run dev`, `GET /api/products`, найти `requestId` в логах и в header `X-Request-Id`.
2. Временно изменить `repositories/productRepository.js`: `where: { id: String(id) }` → `GET /api/products/1` → HTTP 500 → в terminal найти первую строку stack trace из вашего проекта (файл:строка) **[скриншот]**.
3. `node --inspect server.js` / `node --inspect-brk server.js`, breakpoint в `getProduct`, Step Into → увидеть момент превращения числа в строку **[скриншот]**. Вернуть исправление (`where: { id }`).
4. Redaction: временно добавить `logger.info({ email, password: "secret123", accessToken: "eyJ.test.token" }, "Redaction demo")` → в выводе `[Redacted]`; удалить demo.
5. Остановить PostgreSQL → `GET /api/products` → 500; по `requestId` найти error log → причина в DB connection, а не в Router.

**Как читать stack trace:** верхняя строка — тип и сообщение ошибки; ниже — цепочка вызовов от места ошибки к её источникам; ищем первую строку из файлов проекта (не `node_modules`/`node:internal`) — там локализуется причина.

**Вывод:** внедрены structured logs с request ID и redaction; ошибки диагностируются по requestId; клиент не получает stack trace; исправленная ошибка закреплена regression test.

---

## ЛР-5. Подготовка к Production

**Цель:** подготовить API к production: env-конфигурация, fail-fast, health checks, graceful shutdown, безопасные ошибки, reverse proxy.

**Что сделано:** `config/env.js` (обязательные переменные, валидация `PORT`, `NODE_ENV`, `CORS_ORIGIN`); `.env.production.example`; `.gitignore`; `routes/healthRoutes.js` (`/health/live`, `/health/ready`); graceful shutdown в `server.js` (SIGINT/SIGTERM, `server.close()`, `prisma.$disconnect()`, force-timeout 10 с); `app.disable("x-powered-by")`; `trust proxy = 1` только в production; npm scripts `start`, `start:prod:local`; tests: `tests/unit/env.test.js` (fail-fast без `JWT_SECRET` и др.), `tests/unit/healthRoutes.test.js` (503 при недоступной БД — без PostgreSQL), `tests/integration/health.api.test.js` (X-Request-Id, JSON, `/health/live` не раскрывает конфигурацию).

**Ручные проверки (пп. 6, 13, 18, 22):** запуск без `JWT_SECRET` → `Missing required environment variable: JWT_SECRET`; остановка PostgreSQL → `/health/live` 200, `/health/ready` 503; Ctrl+C → в log `Shutdown started` / `Shutdown completed`; `npm run start:prod:local` (создайте `.env.production` из примера). **[скриншоты]**

**Production-readiness checklist проекта:** `docs/production-checklist.md`, раздел 1.

**Вывод:** приложение стартует только с корректной конфигурацией, различает liveness и readiness, корректно завершается и не раскрывает внутренние детали.

---

## ЛР-6. CI с GitHub Actions

**Цель:** автоматический запуск тестов Internet Shop REST API в GitHub Actions после изменений.

**Что сделано:** `.github/workflows/ci.yml` (push/PR в `main`, Node.js 22, `npm ci`, `npx prisma generate`, временный PostgreSQL 17 `shop_test` с health check, `npx prisma migrate deploy`, `npm test`); script `test` содержит `--runInBand`.

**Что сделать вам:** `npm install` (создать и закоммитить `package-lock.json` — без него `npm ci` упадёт), push в `main`, вкладка **Actions** → **[скриншоты: success run, job `test` со steps, лог шага Run tests]**; затем специально сломать assertion (`toBe(200)` → `toBe(201)`), push → **[скриншот failure + сообщение Jest expected/received + exit code]**; исправить, push → **[скриншот success]**.

### Контрольные вопросы
1. **Что такое Continuous Integration?** Практика частого слияния изменений в общий репозиторий, при которой каждое изменение автоматически собирается и проверяется тестами.
2. **Какое событие запускает workflow?** `push` в ветку `main` и `pull_request`, направленный в `main`.
3. **Для чего GitHub runner?** Это виртуальная машина (`ubuntu-latest`), на которой выполняются шаги job; каждый запуск — в чистом окружении.
4. **Почему `npm ci`?** Ставит зависимости строго по `package-lock.json`, начиная с чистого `node_modules`; падает при несоответствии `package.json` и lock-файла → воспроизводимая установка.
5. **Зачем `package-lock.json`?** Фиксирует точные версии всех (в т.ч. транзитивных) зависимостей, чтобы у всех и в CI были одинаковые версии.
6. **Почему перед тестами `npx prisma generate`?** Prisma Client генерируется из `schema.prisma` и не хранится в Git; без генерации `@prisma/client` не содержит моделей.
7. **Почему integration tests не должны использовать production database?** Tests удаляют и создают данные (`deleteMany`) — можно потерять реальные данные; к тому же это риск для secrets и изоляции.
8. **Что означает `failure`?** Хотя бы один шаг завершился с ненулевым exit code (например, упал тест), job помечается красным.
9. **Где искать причину ошибки workflow?** Actions → нужный run → job → красный шаг → logs (в Jest — первый failed test, expected/received и stack trace).
10. **Что произойдёт после следующего `git push`?** Workflow автоматически запустится для нового commit и повторит все проверки.

**Вывод:** тесты запускаются автоматически при каждом push/PR; CI показывает и успешный, и неуспешный результат, что позволяет быстро находить регрессии.

---

## ЛР-7. Развёртывание на Render

**Цель:** развернуть Internet Shop REST API на Render, подключить managed PostgreSQL и проверить публичный HTTPS API.

**Что подготовлено в коде:** `server.js` — порт из `process.env.PORT` (через `config/env.js`), host `0.0.0.0`; `package.json` — `start`, `test`, `prisma:generate`, `db:deploy`, `engines.node = 22.x`; `prisma` в `dependencies`. Пошаговая инструкция и значения Build/Start Command, env, health check: `docs/deployment.md`.

**Фрагменты для отчёта:** `server.js` (PORT/HOST), `package.json` (scripts + engines), Build Command `npm ci && npx prisma generate`, Start Command `npm run db:deploy && npm start`, имена env variables: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (+ `APP_VERSION`). **[скриншоты Render, результаты `/health/ready`, `GET /api/products`, фрагмент logs, повторный auto-deploy]**

### Контрольные вопросы
1. **Что такое deployment?** Процесс размещения и запуска версии приложения в целевой среде (сборка, конфигурация, миграции, запуск), чтобы оно стало доступно.
2. **Чем PaaS отличается от VPS?** В PaaS платформа берёт на себя инфраструктуру (ОС, сеть, TLS, запуск, деплой из Git), разработчик даёт код и конфигурацию; на VPS всё это администрируется вручную (ОС, Node.js, Nginx, firewall, обновления).
3. **Что берёт на себя Render?** Сборку из Git, запуск и перезапуск процесса, public URL и HTTPS-сертификат, маршрутизацию, managed PostgreSQL, logs, health checks, auto-deploy.
4. **Почему `process.env.PORT`?** Платформа сама назначает порт и направляет на него трафик; жёстко заданный порт приведёт к ошибке «No open ports detected».
5. **Для чего host `0.0.0.0`?** Слушать на всех сетевых интерфейсах контейнера; на `localhost` прокси платформы подключиться не сможет.
6. **Почему `.env` не загружают в repository?** Там secrets; репозиторий доступен другим людям, а история Git хранит данные навсегда. Secrets задаются в Environment платформы.
7. **Internal vs External Database URL?** Internal работает по приватной сети Render внутри региона (быстрее, не выходит в интернет); External — публичный адрес для подключения снаружи (например, с вашего компьютера).
8. **Для чего `prisma migrate deploy`?** Применяет ещё не применённые migrations из `prisma/migrations` к БД без интерактива и без сброса данных (в отличие от `migrate dev`).
9. **Что проверяет `/health/ready`?** Что приложение отвечает и PostgreSQL доступна (`SELECT 1`): 200 `ready` или 503 `not_ready`.
10. **Где искать причину failed deployment?** Render → Web Service → **Deploys** → logs конкретного deployment (build / migrate / start) и вкладка **Logs** (runtime).
11. **Что происходит после push при auto-deploy?** Render получает событие из GitHub, собирает новую версию (Build Command), запускает Start Command, и после успешного health check переключает на неё трафик.

**Вывод:** API опубликован на PaaS Render с managed PostgreSQL; конфигурация и secrets вынесены в Environment, миграции применяются при запуске, работоспособность подтверждена health checks.

---

## ЛР-8. Развёртывание на Linux-сервере

**Цель:** развернуть API на Ubuntu Server с PostgreSQL, systemd и Nginx; закрыть внутренние порты.

**Что подготовлено:** `deploy/linux/internet-shop.service`, `nginx-internet-shop.conf`, `internet-shop.env.example` (с `HOST=127.0.0.1` — Express слушает только loopback), `setup-server.sh`; пошаговая инструкция — `docs/deployment.md`. **[скриншоты по списку требований лабораторной: версии Ubuntu и Node.js, `systemctl status postgresql`, структура `/var/www/internet-shop`, `systemctl status internet-shop`, `journalctl`, `nginx -t`, `ufw status`, результаты `/health/live`, `/health/ready`, `GET /api/products`]**

### Контрольные вопросы
1. **Почему API запускается не от root?** Принцип наименьших привилегий: при уязвимости в приложении злоумышленник получит права обычного пользователя `shop`, а не всего сервера.
2. **Зачем systemd?** Менеджер служб: запускает приложение при загрузке, перезапускает при падении, учитывает зависимости (`After=postgresql.service`), собирает logs в journald, управляется через `systemctl`.
3. **Что делает `Restart=on-failure`?** Перезапускает процесс при аварийном завершении (ненулевой код, сигнал); после штатной остановки `systemctl stop` не перезапускает. Пауза — `RestartSec=5`.
4. **Почему `DATABASE_URL` использует `127.0.0.1`?** PostgreSQL работает на том же сервере, соединение идёт через loopback и не выходит в сеть.
5. **Для чего `prisma migrate deploy`?** Создаёт/обновляет таблицы в `shop_db` по migrations из репозитория.
6. **Почему порт 3000 не открывается в UFW?** Express предназначен только для Nginx; наружу должны быть открыты 80/443 (и SSH). Прямой доступ к 3000 позволил бы обойти Nginx. Дополнительно `HOST=127.0.0.1` не даёт приложению слушать внешние интерфейсы.
7. **Какую роль выполняет Nginx?** Reverse proxy: принимает внешние HTTP(S)-запросы, при необходимости терминирует TLS и передаёт запросы в Express, добавляя `X-Forwarded-*`.
8. **Что означает 502 Bad Gateway?** Nginx не смог получить корректный ответ от upstream (приложение не запущено, упало или слушает другой порт).
9. **Где application logs?** В journald: `sudo journalctl -u internet-shop`; logs Nginx — `/var/log/nginx/access.log` и `error.log`.
10. **Почему сначала `localhost:3000`, потом public URL?** Так отделяется проблема приложения/БД от проблем Nginx, firewall и сети — область поиска сужается.
11. **Что нужно для HTTPS?** Domain, DNS A-record на IP сервера, открытые 80/443, `server_name` в Nginx и сертификат (Let’s Encrypt через Certbot) с автопродлением.

**Вывод:** API работает как systemd service, доступен через Nginx на 80 порту; внутренние порты 3000 и 5432 снаружи закрыты; сервис стартует автоматически.

---

## ЛР-9. Обновление и сопровождение в Production

**Цель:** выполнить учебное production-обновление и подтвердить работоспособность health checks, smoke tests и logs.

**Что подготовлено:** `GET /version` (`{ name, version }`, без secrets; версия — из `APP_VERSION`) + тест; `deploy/linux/backup.sh`, `update.sh`, `rollback.sh`; `scripts/smoke-test.sh` / `.ps1`; чеклисты, release record и rollback plan — `docs/production-checklist.md`.

**Что сделать вам:** commit новой версии и записать hash (`git rev-parse --short HEAD`); CI/тесты зелёные; backup; обновление (Linux — `update.sh`; Render — push и Deploys); `/health/live`, `/health/ready`, `GET /api/products`, `/version`; smoke tests; logs; заполнить release record. **[скриншоты/вывод команд]**

**Smoke tests (описание):** `GET /health/live` 200, `/health/ready` 200, `/version` 200, `GET /api/products` 200, `GET /api/products/999999999` 404, `GET /api/products/abc` 400, `POST /api/products` без token 401; при наличии `SMOKE_EMAIL`/`SMOKE_PASSWORD` — login и protected endpoint с token.

**Менялась ли БД:** в этой версии migrations нет (добавлен только `/version`) — backup выполнен как тренировка процесса.

### Контрольные вопросы
1. **Чем deployment отличается от release?** Deployment — техническая установка версии в среду; release — выпуск версии пользователям после подтверждения, что она работает (health, smoke, logs), и фиксация результата.
2. **Зачем фиксировать commit hash?** Он однозначно определяет версию кода: по нему воспроизводят сборку, сопоставляют логи и баги с версией и выбирают точку отката.
3. **Почему перед migration нужен backup?** Migration может изменить или удалить данные/структуру необратимо; backup позволяет восстановиться.
4. **Почему rollback БД сложнее rollback кода?** Код откатывается переключением на старый commit, а данные уже изменились (новые записи, изменённая схема); откат схемы может потерять данные, нужны backup или обратная migration.
5. **Какая команда применяет Prisma migrations в production?** `npx prisma migrate deploy`.
6. **Зачем smoke tests после deployment?** Быстро подтверждают в реальной среде (конфигурация, БД, сеть, proxy), что ключевые сценарии работают; CI этого не покрывает.
7. **Где смотреть logs на Linux?** `sudo journalctl -u internet-shop`, а также `/var/log/nginx/access.log` и `error.log`.
8. **Где смотреть logs на Render?** Dashboard → Web Service → **Logs** (runtime) и **Deploys** → logs deployment (build/migrate/start).
9. **Что делать при 502 после обновления?** `systemctl status internet-shop` → `journalctl -u internet-shop` → `curl http://127.0.0.1:3000/health/live` → `nginx -t` → `/var/log/nginx/error.log`; найти причину (нет env, ошибка migration, упал старт) и исправить либо откатить на предыдущий commit.
10. **Минимальный production checklist?** git status, commit/tag, CI/tests, изменения env, backup БД, получение версии, `npm ci`, `prisma generate`, `prisma migrate deploy`, restart/redeploy, health checks, smoke tests, logs, фиксация release, rollback notes.

**Вывод:** обновление выполнено по контролируемому процессу (проверка → backup → деплой → health → smoke → logs → запись release) с готовым планом отката.
