import { fileURLToPath } from "node:url";

export const srcPath = fileURLToPath(new URL("../src", import.meta.url));
