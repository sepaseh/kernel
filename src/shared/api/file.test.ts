import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "./client";
import { uploadFile } from "./file";

vi.mock("./client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("file API", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("uploads the selected file with its visibility", async () => {
    const file = new File(["logo"], "logo.svg", {
      type: "image/svg+xml",
    });
    const response = {
      contentType: "image/svg+xml",
      id: "file-1",
      url: "http://localhost:5173/logo.svg",
      visibility: "public" as const,
    };
    vi.mocked(apiClient.post).mockResolvedValue(response);

    await expect(uploadFile(file, "public")).resolves.toEqual(response);

    const [path, body] = vi.mocked(apiClient.post).mock.calls[0];
    expect(path).toBe("/files");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect((body as FormData).get("visibility")).toBe("public");
  });
});
