import { expect, it, vi } from "vitest";

import { render, screen } from "@/test/render";
import { StoryShell } from "@/test/storybook/StoryShell";

import { FormDrawer } from "./FormDrawer";

it("exposes cancel and submit actions", async () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();
  const { user } = render(
    <StoryShell>
      <FormDrawer
        onClose={onClose}
        onSubmit={onSubmit}
        open
        submitting={false}
        title="Example"
      >
        Content
      </FormDrawer>
    </StoryShell>,
  );

  await user.click(screen.getByRole("button", { name: "لغو" }));
  await user.click(screen.getByRole("button", { name: "ثبت" }));

  expect(onClose).toHaveBeenCalledOnce();
  expect(onSubmit).toHaveBeenCalledOnce();
});
