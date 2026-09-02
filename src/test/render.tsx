import type { RenderOptions } from "@testing-library/react";
import { render as testingLibraryRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

export { screen } from "@testing-library/react";

export const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
) => ({
  user: userEvent.setup(),
  ...testingLibraryRender(ui, options),
});
