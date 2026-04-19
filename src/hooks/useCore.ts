import { useContext } from "react";

import { CoreContext } from "@/contexts/Core";

export const useCore = () => {
  const context = useContext(CoreContext);

  if (!context) throw new Error("useCore must be used within a CoreProvider");

  return context;
};
