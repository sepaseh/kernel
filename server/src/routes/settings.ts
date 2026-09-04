import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { files, settings } from "../db/schema.ts";
import type { AppEnvironment } from "../http.ts";
import { ApiError, authenticate, parseJson, requiredString } from "../http.ts";

const languages = [
  {
    calendar: "jalali",
    code: "fa",
    direction: "rtl",
    name: "Persian",
    native_name: "فارسی",
  },
  {
    calendar: "gregorian",
    code: "ar",
    direction: "rtl",
    name: "Arabic",
    native_name: "العربية",
  },
  {
    calendar: "gregorian",
    code: "tr",
    direction: "ltr",
    name: "Turkish",
    native_name: "Türkçe",
  },
  {
    calendar: "gregorian",
    code: "en",
    direction: "ltr",
    name: "English",
    native_name: "English",
  },
  {
    calendar: "gregorian",
    code: "fr",
    direction: "ltr",
    name: "French",
    native_name: "Français",
  },
  {
    calendar: "gregorian",
    code: "de",
    direction: "ltr",
    name: "German",
    native_name: "Deutsch",
  },
  {
    calendar: "gregorian",
    code: "es",
    direction: "ltr",
    name: "Spanish",
    native_name: "Español",
  },
  {
    calendar: "gregorian",
    code: "it",
    direction: "ltr",
    name: "Italian",
    native_name: "Italiano",
  },
  {
    calendar: "gregorian",
    code: "ru",
    direction: "ltr",
    name: "Russian",
    native_name: "Русский",
  },
  {
    calendar: "gregorian",
    code: "pt",
    direction: "ltr",
    name: "Portuguese",
    native_name: "Português",
  },
] as const;

const paletteKeys = [
  "color_bg_base",
  "color_bg_container",
  "color_border",
  "color_link",
  "color_primary",
  "color_text_base",
  "color_text_description",
] as const;

const parsePalette = (value: unknown, name: string) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "fieldRequired", { field: name });
  }
  const record = value as Record<string, unknown>;
  if (
    !paletteKeys.every(
      (key) =>
        typeof record[key] === "string" && /^#[\da-f]{6}$/i.test(record[key]),
    )
  ) {
    throw new ApiError(400, "colorInvalid", { field: name });
  }
  return Object.fromEntries(paletteKeys.map((key) => [key, record[key]]));
};

const serializeSettings = async (
  context: Parameters<typeof authenticate>[0],
) => {
  const { database, storage } = context.get("dependencies");
  const value = await database.query.settings.findFirst({
    where: eq(settings.id, 1),
  });
  if (!value) throw new ApiError(500, "settingsNotInitialized");
  const language = languages.find(({ code }) => code === value.languageCode);
  if (!language) throw new ApiError(500, "languageInvalid");
  const logo = async (id: string | null) => {
    if (!id) return undefined;
    const file = await database.query.files.findFirst({
      where: eq(files.id, id),
    });
    if (!file) return undefined;
    const url = storage.url(file.bucket, file.objectKey, file.visibility);
    return url ? { id: file.id, url } : undefined;
  };
  const darkLogo = await logo(value.darkLogoId);
  const lightLogo = await logo(value.lightLogoId);
  return {
    ...(darkLogo && { dark_logo: darkLogo }),
    dark_theme: JSON.parse(value.darkTheme) as unknown,
    language,
    ...(lightLogo && { light_logo: lightLogo }),
    light_theme: JSON.parse(value.lightTheme) as unknown,
  };
};

export const createSettingsRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/", async (context) =>
    context.json(await serializeSettings(context)),
  );

  app.put("/", async (context) => {
    await authenticate(context, { permission: "settings.update" });
    const body = await parseJson(context);
    const languageCode = requiredString(body.language_code, "language_code");
    if (!languages.some(({ code }) => code === languageCode)) {
      throw new ApiError(404, "languageNotFound");
    }
    const darkTheme = parsePalette(body.dark_theme, "dark_theme");
    const lightTheme = parsePalette(body.light_theme, "light_theme");
    const darkLogoId =
      typeof body.dark_logo_id === "string" ? body.dark_logo_id : null;
    const lightLogoId =
      typeof body.light_logo_id === "string" ? body.light_logo_id : null;
    const database = context.get("dependencies").database;
    for (const logoId of [darkLogoId, lightLogoId]) {
      if (!logoId) continue;
      const file = await database.query.files.findFirst({
        where: eq(files.id, logoId),
      });
      if (!file || file.visibility !== "public") {
        throw new ApiError(404, "publicLogoNotFound");
      }
    }
    await database
      .update(settings)
      .set({
        darkLogoId,
        darkTheme: JSON.stringify(darkTheme),
        languageCode,
        lightLogoId,
        lightTheme: JSON.stringify(lightTheme),
      })
      .where(eq(settings.id, 1));
    return context.json(await serializeSettings(context));
  });

  return app;
};

export const createLanguageRoutes = () => {
  const app = new Hono<AppEnvironment>();
  app.get("/", async (context) => {
    await authenticate(context);
    return context.json(languages);
  });
  return app;
};
