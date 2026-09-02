import { expect, it, vi } from "vitest";

import { uploadFile } from "@/shared/api";
import { render } from "@/test/render";
import { StoryShell } from "@/test/storybook/StoryShell";

import { LogoUpload } from "./LogoUpload";

vi.mock("@/shared/api", () => ({ uploadFile: vi.fn() }));

it("uploads a selected public logo and reports its identifier", async () => {
  const onChange = vi.fn();
  vi.mocked(uploadFile).mockResolvedValue({
    contentType: "image/png",
    id: "logo-1",
    url: "/logo.png",
    visibility: "public",
  });
  const { container, user } = render(
    <StoryShell>
      <LogoUpload onChange={onChange} />
    </StoryShell>,
  );
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  const file = new File(["logo"], "logo.png", { type: "image/png" });

  expect(input).not.toBeNull();
  await user.upload(input!, file);

  expect(uploadFile).toHaveBeenCalledWith(file, "public");
  expect(onChange).toHaveBeenCalledWith("logo-1");
});
