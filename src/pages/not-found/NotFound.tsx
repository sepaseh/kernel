import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("notFoundDescription")}
      extra={<Button type="primary">{t("backHome")}</Button>}
    />
  );
};
