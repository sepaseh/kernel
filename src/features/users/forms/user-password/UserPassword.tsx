/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { updateUserPassword } from "@/features/users/api";
import { UserPasswordParams, UserProps } from "@/features/users/types";
import { modalKeys } from "@/shared/config";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { PasswordFields } from "@/shared/ui/password-fields";

type UserPasswordFormParams = UserPasswordParams & {
  confirmPassword: string;
};

type UserPasswordFormProps = {
  data?: UserProps;
};

export const UserPasswordForm: FC<UserPasswordFormProps> = ({ data }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserPasswordFormParams>();
  const goBack = useGoBack();

  const handleSubmit = async ({ password }: UserPasswordFormParams) => {
    if (submitting || !data) return;

    try {
      setSubmitting(true);
      await updateUserPassword(data.id, { password });
      messageAPI.success(t("passwordUpdated"));
      goBack();
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hash === modalKeys.password) {
      if (data) setOpen(true);
      else goBack();
    } else {
      if (open) form.resetFields();
      setOpen(false);
      setSubmitting(false);
    }
  }, [data, form, goBack, hash, open]);

  return (
    <Drawer
      closeIcon={false}
      footer={
        <Space>
          <Button loading={submitting} onClick={goBack}>
            {t("cancel")}
          </Button>
          <Button
            loading={submitting}
            onClick={() => form.submit()}
            type="primary"
          >
            {t("submit")}
          </Button>
        </Space>
      }
      mask={{ closable: false }}
      onClose={goBack}
      open={open}
      styles={{ footer: { textAlign: "end" } }}
      title={t("changePassword")}
    >
      <Form<UserPasswordFormParams>
        form={form}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
      >
        <PasswordFields passwordLabel="newPass" />
      </Form>
    </Drawer>
  );
};
