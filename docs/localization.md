# Languages, direction, and calendars

Kernel ships with Arabic (`ar`), German (`de`), English (`en`), Spanish (`es`),
Persian (`fa`), French (`fr`), Italian (`it`), Portuguese (`pt`), Russian (`ru`),
and Turkish (`tr`). Persian is the default and fallback frontend language.

| Language                  | Layout direction | Display calendar |
| ------------------------- | ---------------- | ---------------- |
| Persian                   | RTL              | Jalali           |
| Arabic                    | RTL              | Gregorian        |
| Other supported languages | LTR              | Gregorian        |

## How language is selected

The frontend initially reads its saved language through `src/shared/storage`.
`CoreProvider` then fetches public application settings and applies the server's
language, logos, and palettes when that request succeeds. Language changes are
saved locally and observed across tabs. A successful settings update applies
the new language to the current UI; other clients load the global setting on a
subsequent settings fetch. There is no server push to existing sessions.

`AntdProvider` selects component translations and direction and sets the HTML
`lang` and `dir` attributes. `CoreProvider` selects the Day.js locale and calendar;
English maps to `en-gb`, Persian uses the local `faDayjs` resource plus Jalaliday.

Backend error messages and permission labels use the global
`settings.language_code`, with English as the backend translation fallback.
They do not select language from `Accept-Language` or an individual user's
preference. Names, role titles, and other user-entered values are preserved.
The `/languages` catalog requires authentication; `GET /settings` is public so
the login page can load branding and language.

## Add a language

1. Add its code to `src/shared/config/language.ts` so saved values and the
   `Language` type recognize it.
2. Create `src/shared/i18n/locales/<code>.ts` with the same keys and interpolation
   placeholders as the existing resources. Register it in
   `src/shared/i18n/locales/index.ts`. Persian currently defines the frontend's
   typed translation-key contract in `src/shared/i18n/index.ts`.
3. Add the Ant Design locale import and `localeConfigs` entry in
   `src/app/providers/antd/Antd.tsx`, including its LTR/RTL direction.
4. Import the Day.js locale in `src/app/providers/core/Core.tsx` and adjust the
   locale/calendar mapping if it needs more than the existing Gregorian default.
5. Add the code, display/native names, direction, and calendar to the catalog in
   `server/src/routes/settings.ts`. The server validates setting changes against
   that catalog; a frontend translation file alone does not make it selectable.
6. Add a complete backend resource in `server/src/i18n/locales.ts`. English and
   Persian are defined in `server/src/i18n.ts`; `TranslationResource` checks the
   shared backend keys. Update all resources when adding a message key.
7. Update `/languages` and relevant settings examples in the Bruno collection,
   plus corresponding mocks, stories, and contract expectations.

The catalog's `direction` and `calendar` describe the contract, but the frontend
still uses its own provider mappings. Keep both synchronized when adding a
language or changing calendar behavior.

## Dates and layout

Calendar API values remain Gregorian `YYYY-MM-DD` strings regardless of display
language. Follow the existing `formatCalendarDate` conversion in
`src/features/calendar/Calendar.tsx`: switch a selected Day.js value to
`calendar("gregory")` before formatting it for the API. Do not submit a formatted
Jalali date or convert this date-only contract to a timezone-dependent timestamp.

Use theme spacing and logical CSS properties where appropriate so direction
changes do not require duplicate layouts. The bundled Vazirmatn font remains
local to the application. Test long labels, interpolated values, numeric input,
drawers, pagination, and calendar month/year boundaries.

## Verification

Run focused provider and locale tests, `npm run typecheck`, and
`npm run server:test` after changing the catalogs or backend translations.
`e2e/localization.spec.ts` covers English/LTR and Persian/RTL browser flows;
extend coverage for the language or calendar behavior being introduced.
Confirm a saved language survives reload, the global setting is applied, and
calendar requests still contain Gregorian dates.

See [Testing](testing.md) for browser setup and
[Feature development](feature-development.md) for adding translated pages.
