# ФОРК ИТ — Прототип v3
**Оптимизатор простоев горной техники** · Студия Луч

## Запуск
```bash
npm install
npm run dev
```
Открыть: **http://localhost:3000**

## Шрифты (согласно гайдбуку ФОРК ИТ)

| Назначение | Шрифт |
|---|---|
| Заголовки, KPI, лейблы, лого | **Druk Wide Medium** |
| Текст, подзаголовки, сноски | **Golos Text** |

### Как подключить Druk Wide
Druk Wide — платный шрифт от Commercial Type.
Скачайте на https://commercialtype.com/catalog/druk/druk_wide

Положите файлы в `/public/fonts/`:
- `DrukWide-Medium-Web.woff2`
- `DrukWide-Medium-Web.woff`
- `DrukWide-Bold-Web.woff2` *(опционально)*
- `DrukWide-Bold-Web.woff` *(опционально)*

**Для демо** автоматически используется Oswald Bold (Google Fonts) —
визуально близкий аналог, грузится без дополнительных файлов.

## Что в v3
- ✅ Druk Wide для заголовков, KPI, nav-лейблов, лого, заголовков колонок
- ✅ Golos Text для всего текстового контента
- ✅ Тёмный / светлый режим (🌙 / ☀️ в шапке)
- ✅ Все шрифты через CSS-переменные `--font-display` / `--font-body`

## Стек
Next.js 15 · TypeScript · SCSS Modules
