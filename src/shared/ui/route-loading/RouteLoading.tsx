import { Spin } from "antd";
import { useTranslation } from "react-i18next";

export const RouteLoading = () => {
  const { t } = useTranslation();

  return (
    <output aria-label={t("loading")}>
      <Spin fullscreen size="large" />
    </output>
  );
};
