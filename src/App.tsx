import { ErrorBoundary } from "@/components/ErrorBoundary";
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
