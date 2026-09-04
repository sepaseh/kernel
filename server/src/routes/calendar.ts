import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";

import { calendarDates } from "../db/schema.ts";
import type { AppEnvironment } from "../http.ts";
import { ApiError, authenticate, parseJson, requiredString } from "../http.ts";

const isDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value)
  );
};

export const createCalendarRoutes = () => {
  const app = new Hono<AppEnvironment>();

  app.get("/", async (context) => {
    await authenticate(context, { permission: "calendar.read" });
    const values = await context
      .get("dependencies")
      .database.select()
      .from(calendarDates)
      .orderBy(asc(calendarDates.date));
    return context.json(values.map(({ date }) => date));
  });

  app.post("/", async (context) => {
    await authenticate(context, { permission: "calendar.update" });
    const body = await parseJson(context);
    const date = requiredString(body.date, "date");
    if (!isDate(date)) throw new ApiError(400, "calendarDateFormat");
    await context
      .get("dependencies")
      .database.insert(calendarDates)
      .values({ date })
      .onConflictDoNothing();
    return context.body(null, 200);
  });

  app.delete("/:date", async (context) => {
    await authenticate(context, { permission: "calendar.update" });
    const result = await context
      .get("dependencies")
      .database.delete(calendarDates)
      .where(eq(calendarDates.date, context.req.param("date")))
      .returning();
    if (!result.length) throw new ApiError(404, "calendarDateNotFound");
    return context.body(null, 200);
  });

  return app;
};
