import { Button, Drawer, type DrawerProps, Space } from "antd";
import { useTranslation } from "react-i18next";

type FormDrawerProps = Omit<DrawerProps, "onClose"> & {
  onClose: NonNullable<DrawerProps["onClose"]>;
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
      {...rest}
    >
      {children}
    </Drawer>
  );
};
