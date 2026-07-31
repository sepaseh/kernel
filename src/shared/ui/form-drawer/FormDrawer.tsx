import { Button, Drawer, Space } from "antd";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type FormDrawerProps = {
  afterOpenChange?: (open: boolean) => void;
  children: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  open: boolean;
  submitting: boolean;
  title: ReactNode;
};

export const FormDrawer = ({
  afterOpenChange,
  children,
  onClose,
  onSubmit,
  open,
  submitting,
  title,
}: FormDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      afterOpenChange={afterOpenChange}
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
      open={open}
      styles={{ footer: { textAlign: "end" } }}
      title={title}
    >
      {children}
    </Drawer>
  );
};
