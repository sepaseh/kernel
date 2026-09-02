import { waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { render } from "@/test/render";

import {
  createCalendarDate,
  deleteCalendarDate,
  fetchCalendarDates,
} from "./api";
import { CalendarPage } from "./Calendar";

const mocks = vi.hoisted(() => ({
  messageError: vi.fn(),
  messageAPI: {
    error: vi.fn(),
    success: vi.fn(),
  },
  messageSuccess: vi.fn(),
}));

mocks.messageAPI.error = mocks.messageError;
mocks.messageAPI.success = mocks.messageSuccess;

vi.mock("@/app/hooks", () => ({
  useAntd: () => ({
    messageAPI: mocks.messageAPI,
    token: { paddingSM: 8 },
  }),
  useCore: () => ({
    language: "en",
    user: { isSystemAdmin: true },
  }),
}));

vi.mock("./api", () => ({
  createCalendarDate: vi.fn(),
  deleteCalendarDate: vi.fn(),
  fetchCalendarDates: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(fetchCalendarDates).mockResolvedValue(["2026-09-15"]);
  vi.mocked(createCalendarDate).mockResolvedValue(undefined);
  vi.mocked(deleteCalendarDate).mockResolvedValue(undefined);
});

it("loads calendar dates and removes a selected configured date", async () => {
  const { container, user } = render(<CalendarPage />);

  await waitFor(() => expect(fetchCalendarDates).toHaveBeenCalledOnce());
  const configuredDate = container.querySelector<HTMLElement>(
    '[title="2026-09-15"]',
  );
  expect(configuredDate).not.toBeNull();

  await user.click(configuredDate!);

  await waitFor(() =>
    expect(deleteCalendarDate).toHaveBeenCalledWith("2026-09-15"),
  );
  expect(mocks.messageSuccess).toHaveBeenCalledWith(
    "تقویم با موفقیت به‌روزرسانی شد.",
  );
});
