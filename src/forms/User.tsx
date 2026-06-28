import { Button, Drawer, Form, FormProps, Input, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { createUser, updateUser } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { UserProps } from "@/types";
import { tinyId } from "@/utils";

type StateProps = {
  open?: boolean;
  submitting?: boolean;
};

export const UserForm: FC<{ data?: UserProps; onFinish: () => void }> = ({
  data,
  onFinish,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const { open, submitting } = state;
  const { messageAPI, notificationAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserProps>();
  const goBack = useGoBack();
  const isUpdate = hash === modalKeys.update && !!data;

  const handleSubmit: FormProps<UserProps>["onFinish"] = async (values) => {
    if (submitting) return;

    try {
      setState((prevState) => ({ ...prevState, submitting: true }));

      if (isUpdate) {
        const { message } = await updateUser(data.id, values);

        messageAPI.success(message);
      } else {
        const password = tinyId();

        await createUser({ ...values, password });

        navigator.clipboard.writeText(password);

        notificationAPI.success({
          title: t("password"),
          description: password,
        });
      }

      goBack();

      onFinish();
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
    } finally {
      setState((prevState) => ({ ...prevState, submitting: false }));
    }
  };

  useEffect(() => {
    void (() => {
      switch (hash) {
        case modalKeys.create: {
          setState((prevState) => ({ ...prevState, open: true }));

          break;
        }
        case modalKeys.update: {
          if (data) {
            setState((prevState) => ({ ...prevState, open: true }));

            form.setFieldsValue(data);
          } else {
            goBack();
          }

          break;
        }
        default: {
          if (open) form.resetFields();

          setState({});

          break;
        }
      }
    })();
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
      title={t(isUpdate ? "update" : "create")}
      styles={{ footer: { textAlign: "end" } }}
    >
      <Form<UserProps> form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item<UserProps>
          label={t("firstName")}
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserProps>
          label={t("lastName")}
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserProps>
          label={t("personnelCode")}
          name="personnelCode"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserProps>
          label={t("username")}
          name="username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
