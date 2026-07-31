import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { routeTree } from "@/config";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("notFoundDescription")}
      extra={
        <Link to={routeTree.root.path}>
          <Button type="primary">{t("backHome")}</Button>
        </Link>
      }
    />
  );
};
