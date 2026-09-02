import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/shared/api";

import {
  createCalendarDate,
  deleteCalendarDate,
  fetchCalendarDates,
} from "./api";

vi.mock("@/shared/api", () => ({
  apiClient: {
    del: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(apiClient.get).mockResolvedValue(["2026-09-15"]);
  vi.mocked(apiClient.post).mockResolvedValue(undefined);
  vi.mocked(apiClient.del).mockResolvedValue(undefined);
});

describe("calendar API", () => {
  it("lists configured calendar dates", async () => {
    await expect(fetchCalendarDates()).resolves.toEqual(["2026-09-15"]);
    expect(apiClient.get).toHaveBeenCalledWith("/calendar");
  });

  it("creates and deletes a date", async () => {
    await createCalendarDate("2026-09-15");
    await deleteCalendarDate("2026-09-15");

    expect(apiClient.post).toHaveBeenCalledWith("/calendar", {
      date: "2026-09-15",
    });
    expect(apiClient.del).toHaveBeenCalledWith("/calendar/2026-09-15");
  });
});
