import { Button, Drawer, type DrawerProps, Space } from "antd";
import { useTranslation } from "react-i18next";

type FormDrawerProps = Omit<
  DrawerProps,
  "closeIcon" | "footer" | "mask" | "styles"
> & {
  onSubmit: () => void;
  submitting: boolean;
};

export const FormDrawer = ({
  children,
  onClose,
  onSubmit,
  submitting,
  ...rest
}: FormDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      {...rest}
      closeIcon={false}
      footer={
        <Space>
          <Button loading={submitting} onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button loading={submitting} onClick={onSubmit} type="primary">
            {t("submit")}
          </Button>
        </Space>
      }
      mask={{ closable: false }}
      onClose={onClose}
      styles={{ footer: { textAlign: "end" } }}
    >
      {children}
    </Drawer>
  );
};
