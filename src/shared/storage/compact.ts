import { storageKeys } from "@/shared/config";

import { getState, setState } from "./state";

const defaultCompact = false;

export const getCompact = () => {
  return getState(storageKeys.compact, defaultCompact);
};

export const setCompact = (compact: boolean) => {
  setState(storageKeys.compact, compact);
};
