import { useContext } from "react";

import { CoreContext } from "@/app/contexts";

export const useCore = () => {
  const context = useContext(CoreContext);
  if (!context) throw new Error("useCore must be used within a CoreProvider");

  return context;
};
