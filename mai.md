⏺ Отлично! ✅ Теперь всё правильно. Вот обновленные URL-ы для настроек MAIB:

  URL-ы для панели MAIB:

  1. Callback URL (webhook):

  https://ваш-railway-домен.railway.app/api/maib/callback

  2. Ok URL (успешная оплата):

  https://ваш-railway-домен.railway.app/api/maib/return/ok

  3. Fail URL (неудачная оплата):


  https://ваш-railway-домен.railway.app/api/maib/return/fail

  ## Настройка переменных окружения:

  ### Railway (Production):
  В настройках Railway проекта добавьте:
  ```bash
  API_URL=https://ваш-railway-домен.railway.app
  MAIB_MOCK_MODE=false  # Отключите mock mode в production!

  Локально (Development):

  В файле server/.env обновите:
  API_URL=http://localhost:3001
  MAIB_MOCK_MODE=true  # Для локальной разработки

  Static IP для MAIB:

  1. Railway → Settings → Networking → Enable Static Outbound IP
  2. Скопируйте полученный IP адрес
  3. Укажите этот IP в панели MAIB как статический IP

  Теперь URL-ы соответствуют вашей архитектуре API! 🎉