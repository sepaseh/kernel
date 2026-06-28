import { theme } from "antd";

const { useToken } = theme;

export const DashboardPage = () => {
  const { token } = useToken();

  return (
    <div
      style={{
        paddingBlock: token.paddingMD,
        paddingInline: token.paddingSM,
        flexGrow: 1,
      }}
    />
  );
};