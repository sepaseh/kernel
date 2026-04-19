import { afterEach, vi } from "vitest";

const store: Record<string, string> = {};

const localStorageMock: Storage = {
  clear: vi.fn(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  }),
  getItem: vi.fn((key: string) => store[key] ?? null),
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  get length() {
    return Object.keys(store).length;
  },
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
};

Object.defineProperty(global, "localStorage", { value: localStorageMock });

afterEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
