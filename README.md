# AVANA — альбомы на Cloudflare Workers (static assets + API)

- `public/` — статические страницы альбомов (HTML/CSS/JS/картинки)
- `worker.js` — единая точка входа: обрабатывает /api/health и
  /api/albums/:album/access, всё остальное отдаёт как статику из public/
- `wrangler.jsonc` — конфигурация для Cloudflare

## Переменные окружения (Settings → Variables and Secrets)

- IMAGEKIT_PRIVATE_KEY
- IMAGEKIT_URL_ENDPOINT
- ALBUM_AUTUMN_PASSWORD (например 123456)
- ALBUM_WINTER_PASSWORD (например 123456)
