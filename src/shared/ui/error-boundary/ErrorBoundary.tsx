import {
  Component,
  type ErrorInfo,
  Fragment,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { useTranslation } from "react-i18next";

import { reportError } from "@/shared/lib";

type State = {
  hasError: boolean;
};

export const ErrorFallback = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Result
      status="500"
      title="500"
      subTitle={t("unexpectedError")}
      extra={
        <Button onClick={() => window.location.reload()} type="primary">
          {t("reload")}
        </Button>
      }
    />
  );
};

export class ErrorBoundary extends Component<PropsWithChildren, State> {
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

    return <ErrorFallback />;
  }
}
import { Button, Result } from "antd";
