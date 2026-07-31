import "@/assets/styles/index.css";
import "@/assets/styles/vazirmatn.css";
import "@/shared/i18n";

import type { Preview } from "@storybook/react-vite";
import { sb } from "storybook/test";

import { PreviewFrame } from "./PreviewFrame";

sb.mock(import("../src/features/account/api.ts"), { spy: true });
sb.mock(import("../src/features/auth/api.ts"), { spy: true });
sb.mock(import("../src/features/roles/api.ts"), { spy: true });
sb.mock(import("../src/features/users/api.ts"), { spy: true });

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <PreviewFrame
        direction={context.globals.direction}
        themeMode={context.globals.theme}
      >
        <Story />
      </PreviewFrame>
    ),
  ],
  globalTypes: {
    direction: {
      description: "Document direction",
      toolbar: { items: ["ltr", "rtl"] },
    },
    theme: {
      description: "Ant Design theme",
      toolbar: { items: ["light", "dark"] },
    },
  },
  initialGlobals: { direction: "ltr", theme: "light" },
  parameters: {
    a11y: { test: "error" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
};

export default preview;
