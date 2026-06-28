import { AntdProvider, CoreProvider } from "@/providers";

import { Routes } from "./Routes";

export const App = () => (
  <CoreProvider>
    <AntdProvider>
      <Routes />
    </AntdProvider>
  </CoreProvider>
);
