import { Spin } from "antd";
import { useTranslation } from "react-i18next";

export const RouteLoading = () => {
  const { t } = useTranslation();

  return (
    <div aria-label={t("loading")} role="status">
      <Spin fullscreen size="large" />
    </div>
  );
};
