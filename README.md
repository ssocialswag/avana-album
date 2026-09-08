# AWANA — альбомы на Cloudflare Workers (static assets + API)

- `public/` — статические страницы альбомов (HTML/CSS/JS/картинки)
- `worker.js` — единая точка входа: обрабатывает /api/health и
  /api/albums/:album/access, всё остальное отдаёт как статику из public/
- `wrangler.jsonc` — конфигурация для Cloudflare
