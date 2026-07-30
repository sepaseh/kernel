/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, FormProps, Input, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { updateUserPassword } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { UserPasswordParams, UserProps } from "@/types";
import { getErrorMessage } from "@/utils";

type UserPasswordFormParams = UserPasswordParams & {
  confirmPassword: string;
};

export const UserPasswordForm: FC<{ data?: UserProps }> = ({ data }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserPasswordFormParams>();
  const goBack = useGoBack();

  const handleSubmit: FormProps<UserPasswordFormParams>["onFinish"] = async ({
    password,
  }) => {
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
          <Button loading={submitting} onClick={() => goBack()}>
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
      onClose={() => goBack()}
      open={open}
      styles={{ footer: { textAlign: "end" } }}
      title={t("changePassword")}
    >
      <Form<UserPasswordFormParams>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label={t("newPass")}
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password styles={{ input: { direction: "ltr" } }} />
        </Form.Item>
        <Form.Item
          dependencies={["password"]}
          label={t("confirmPass")}
          name="confirmPassword"
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error(t("passsMismatch")));
              },
            }),
          ]}
        >
          <Input.Password styles={{ input: { direction: "ltr" } }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
