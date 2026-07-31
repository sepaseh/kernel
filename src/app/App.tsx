import { AntdProvider, CoreProvider } from "@/app/providers";
import { ErrorBoundary } from "@/shared/ui/error-boundary";

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
