import { useAntdToken } from "antd-style";

export const DashboardPage = () => {
  const token = useAntdToken();

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
