import { AntdProvider } from "@/providers/Antd";
import { CoreProvider } from "@/providers/Core";
import { QueryProvider } from "@/providers/Query";

import { Routes } from "./Routes";

export const App = () => (
  <QueryProvider>
    <CoreProvider>
      <AntdProvider>
        <Routes />
      </AntdProvider>
    </CoreProvider>
  </QueryProvider>
);
