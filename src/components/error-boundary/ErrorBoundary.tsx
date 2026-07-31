import {
  Component,
  type ErrorInfo,
  Fragment,
  type ReactElement,
  type ReactNode,
} from "react";

import { i18nInstance } from "@/app/i18n";
import { reportError } from "@/utils";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
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

  public render(): ReactElement {
    if (!this.state.hasError) {
      return <Fragment>{this.props.children}</Fragment>;
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
