import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_APP_BASE_URL,
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                priority: 30,
                test: /node_modules[\\/](?:react|react-dom|react-router|scheduler)[\\/]/,
              },
              {
                maxSize: 450_000,
                name: "ui",
                priority: 20,
                test: /node_modules[\\/](?:@ant-design|@emotion|@rc-component|antd|antd-style|rc-[^\\/]+)[\\/]/,
              },
              {
                maxSize: 450_000,
                name: "vendor",
                priority: 10,
                test: /node_modules[\\/]/,
              },
            ],
          },
          strictExecutionOrder: true,
        },
      },
    },
    plugins: [react(), basicSsl()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      allowedHosts: true,
      host: true,
    },
  };
});
