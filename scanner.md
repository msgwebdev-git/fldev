# PWA Офлайн-сканер билетов

## Контекст

На фестивале 5000-15000 человек проходят через ворота. Интернет на площадке может пропасть. Нужно приложение для Android, которое сканирует QR-коды билетов и работает без интернета. Решение — PWA (Progressive Web App): открыл ссылку в Chrome → "Добавить на главный экран" → работает как приложение.

## Архитектура

```
Онлайн: /scanner → ввёл PIN → скачал все билеты в IndexedDB
Офлайн: сканирует QR → ищет в IndexedDB → check-in локально
Онлайн: синхронизирует check-ins обратно на сервер
```

## Файловая структура

### Новые файлы

```
# PWA манифест и service worker
public/scanner-manifest.json
public/scanner-sw.js

# Страница сканера (отдельная от i18n, как /admin)
src/app/scanner/layout.tsx              — standalone layout (без i18n)
src/app/scanner/page.tsx                — серверный компонент-обёртка
src/app/scanner/ScannerApp.tsx          — "use client", вся UI логика
src/app/scanner/scanner-db.ts           — IndexedDB обёртка
src/app/scanner/scanner-sync.ts         — синхронизация с сервером

# Next.js API routes (проксируют к Express, прячут API ключ)
src/app/api/scanner/auth/route.ts       — PIN → токен
src/app/api/scanner/manifest/route.ts   — список всех билетов
src/app/api/scanner/checkin/route.ts    — пакетная отправка check-ins
```

### Изменяемые файлы

```
src/middleware.ts                        — добавить /scanner в обход i18n
server/src/routes/scan.ts               — добавить GET /manifest, POST /batch
server/src/services/ticket-cache.ts     — добавить метод getAll()
package.json                             — добавить html5-qrcode
```

## Аутентификация

PIN-код (4-6 цифр), задаётся в env как `SCANNER_PIN`. Охранникам сообщается устно утром.

Поток:
1. Охранник открывает `/scanner`, вводит PIN и имя устройства ("Ворота A")
2. Next.js API проверяет PIN → выдаёт токен (случайная строка, живёт 24 часа)
3. Токен хранится в localStorage
4. Все запросы к API идут с этим токеном

## IndexedDB схема

```
Хранилище "tickets":
  ключ: qrData (CODE.SIGNATURE)
  значение: { ticketCode, customerName, ticketName, optionName,
              orderNumber, isInvitation, checkedInAt, checkedInBy }

Хранилище "pendingCheckins":
  ключ: auto-increment
  значение: { qrData, scannedBy, scannedAt, synced: false }
```

15 000 билетов ≈ 3 MB — в пределах лимита IndexedDB.

## Синхронизация

**Загрузка билетов:** при активации + каждые 5 мин (если онлайн)
- `GET /api/scanner/manifest` → массив всех валидных билетов → сохранить в IndexedDB
- Новые билеты добавляются, существующие обновляются (если check-in с другого устройства)

**Отправка check-ins:** каждые 10 сек (если онлайн)
- Все записи из `pendingCheckins` где `synced=false`
- `POST /api/scanner/checkin` → пакетная отправка
- Сервер возвращает результат для каждого: `ok` или `already_checked_in`
- Конфликт (два устройства сканировали офлайн один билет): первый записался, второй помечается как дубликат. Человек уже прошёл — это ок.

## Безопасность

- HMAC-секрет **не отправляется** на устройство
- Сервер отдаёт список валидных `qrData` (CODE.SIGNATURE пар) — устройство просто делает lookup
- PIN + токен для аутентификации сканера
- `ADMIN_API_KEY` остаётся на сервере (Next.js API route проксирует)

## UI (4 экрана, одна страница)

1. **PIN-вход** — тёмный фон, поле PIN, имя устройства, кнопка "Активировать"
2. **Дашборд** — статус связи (зелёный/красный), кол-во билетов в базе, кол-во check-ins, pending sync, кнопка "СКАНИРОВАТЬ"
3. **Камера** — полноэкранный видоискатель (html5-qrcode), кнопка отмены
4. **Результат** (3 сек, потом назад):
   - ЗЕЛЁНЫЙ: "✓ Проходи!" + имя + тип билета (вибрация 1 раз)
   - ЖЁЛТЫЙ: "⚠ Уже прошёл!" + время check-in (вибрация 2 раза)
   - КРАСНЫЙ: "✕ Недействителен!" (вибрация 3 раза)

## Service Worker

- Файл `public/scanner-sw.js` (vanilla JS, scoped to `/scanner/`)
- App shell (HTML/JS/CSS): cache-first → работает офлайн мгновенно
- API запросы: network-only → никогда не кешируем данные
- При обновлении: удаляет старый кеш, показывает "Обновление доступно"

## Express сервер — новые эндпоинты

**GET /api/scan/manifest** (защищён x-api-key)
- Возвращает все билеты из ticket-cache как массив
- Добавить метод `ticketCache.getAll()` → `Array.from(tickets.entries())`

**POST /api/scan/batch** (защищён x-api-key)
- Принимает `{ checkins: [{ qrData, scannedBy, scannedAt }] }`
- Обрабатывает каждый через существующую логику scanService
- Возвращает массив результатов

## Порядок реализации

1. **Express: manifest + batch** — новые эндпоинты на сервере
2. **Middleware** — /scanner в обход i18n
3. **API routes** — auth, manifest, checkin (Next.js прокси)
4. **IndexedDB + sync** — локальная БД и синхронизация
5. **UI + камера** — ScannerApp с html5-qrcode
6. **PWA** — manifest.json, service worker, иконки

## Проверка

1. Открыть `/scanner` на телефоне → ввести PIN → билеты загрузились
2. Сканировать QR → зелёный экран, билет помечен
3. Сканировать тот же QR → жёлтый экран, дубликат
4. Выключить интернет → сканировать новый QR → работает
5. Включить интернет → pending check-ins синхронизировались
6. Проверить в админке → check-ins появились
