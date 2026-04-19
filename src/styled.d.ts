import "styled-components";

import { GlobalToken } from "antd";

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends GlobalToken {}
}
