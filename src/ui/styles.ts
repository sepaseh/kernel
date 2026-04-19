import { CSSProperties } from "./Stack";

export const styles: Record<string, CSSProperties> = {
  centered: {
    alignItems: "center",
    display: "flex",
    flexGrow: "1",
    justifyContent: "center",
  },
  col: {
    display: "flex",
    flexDirection: "column",
  },
  ellipsis: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  scrollable: {
    overflow: "auto",
  },
};
