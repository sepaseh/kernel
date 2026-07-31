import "@/assets/styles/index.css";
import "@/assets/styles/vazirmatn.css";
import "@/shared/i18n";

import type { Preview } from "@storybook/react-vite";
import { ConfigProvider, theme } from "antd";
import { sb } from "storybook/test";

sb.mock(import("../src/features/account/api.ts"), { spy: true });
sb.mock(import("../src/features/auth/api.ts"), { spy: true });
sb.mock(import("../src/features/roles/api.ts"), { spy: true });
sb.mock(import("../src/features/users/api.ts"), { spy: true });

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <ConfigProvider
        direction={context.globals.direction}
        theme={{
          algorithm:
            context.globals.theme === "dark"
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
          token: { colorPrimary: "#d70015", fontFamily: "inherit" },
        }}
      >
        <Story />
      </ConfigProvider>
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
