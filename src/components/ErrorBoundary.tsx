import { Component, type ErrorInfo, type ReactNode } from "react";

import { i18nInstance } from "@/i18n";
import { reportError } from "@/utils";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      source: "react.error-boundary",
    });
  }

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        style={{
          display: "grid",
          minHeight: "100vh",
          padding: "2rem",
          placeContent: "center",
          textAlign: "center",
        }}
      >
        <h1>{i18nInstance.t("unexpectedError")}</h1>
        <button onClick={() => window.location.reload()} type="button">
          {i18nInstance.t("reload")}
        </button>
      </main>
    );
  }
}
