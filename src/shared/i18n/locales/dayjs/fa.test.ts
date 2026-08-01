import { describe, expect, it } from "vitest";

import { faDayjs } from "./fa";

describe("Persian Day.js locale", () => {
  it("defines complete Persian calendar labels", () => {
    expect(faDayjs.name).toBe("fa");
    expect(faDayjs.weekStart).toBe(6);
    expect(faDayjs.weekdays).toHaveLength(7);
    expect(faDayjs.weekdays[0]).toBe("یک‌شنبه");
    expect(faDayjs.months).toHaveLength(12);
    expect(faDayjs.months[0]).toBe("فروردین");
    expect(faDayjs.jmonths).toEqual(faDayjs.months);
  });

  it("provides stable formats, relative time, and ordinals", () => {
    expect(faDayjs.formats.L).toBe("DD/MM/YYYY");
    expect(faDayjs.relativeTime.future).toBe("در %s");
    expect(faDayjs.relativeTime.past).toBe("%s پیش");
    expect(faDayjs.ordinal(21)).toBe(21);
  });
});
