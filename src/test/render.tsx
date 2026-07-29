import {
  render as testingLibraryRender,
  RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

export { screen } from "@testing-library/react";

export const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">,
) => ({
  user: userEvent.setup(),
  ...testingLibraryRender(ui, options),
});
