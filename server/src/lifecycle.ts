import type { AppLogger } from "./logger.ts";

export const flushAndExit = (logger: AppLogger, code: number) => {
  const deadline = setTimeout(() => process.exit(code), 1_000);
  deadline.unref();
  logger.flush(() => process.exit(code));
};

export const installFatalErrorHandlers = (logger: AppLogger) => {
  let terminating = false;
  const terminate = (error: unknown, source: string) => {
    if (terminating) return;
    terminating = true;
    logger.fatal(
      {
        err: error instanceof Error ? error : new Error("Non-Error failure"),
        event: "server.crashed",
        source,
      },
      "Process failed",
    );
    flushAndExit(logger, 1);
  };
  process.once("uncaughtException", (error) =>
    terminate(error, "uncaughtException"),
  );
  process.once("unhandledRejection", (error: unknown) =>
    terminate(error, "unhandledRejection"),
  );
};
