import { ErrorBoundary } from "@/components/error-boundary";
import { AntdProvider, CoreProvider } from "@/providers";

import { Routes } from "./Routes";

export const App = () => (
  <ErrorBoundary>
    <CoreProvider>
      <AntdProvider>
        <Routes />
      </AntdProvider>
    </CoreProvider>
  </ErrorBoundary>
);
