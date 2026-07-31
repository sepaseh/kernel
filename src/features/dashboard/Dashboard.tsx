import { useAntdToken } from "antd-style";

export const DashboardPage = () => {
  const token = useAntdToken();

  return (
    <div
      style={{
        flexGrow: 1,
        paddingBlock: token.paddingMD,
        paddingInline: token.paddingSM,
      }}
    />
  );
};
