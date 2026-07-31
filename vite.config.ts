import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { srcPath } from "./tooling/paths.ts";

const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; connect-src 'self' https:; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  "Permissions-Policy":
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

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
    preview: {
      headers: securityHeaders,
    },
    resolve: {
      alias: {
        "@": srcPath,
      },
    },
    server: {
      allowedHosts: true,
      host: true,
    },
  };
});
