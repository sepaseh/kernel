/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, Input, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { createUser, updateUser } from "@/features/users/api";
import {
  CreateUserParams,
  UpdateUserParams,
  UserProps,
} from "@/features/users/types";
import { modalKeys } from "@/shared/config";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { PasswordFields } from "@/shared/ui/password-fields";

type UserFormParams = CreateUserParams & {
  confirmPassword: string;
};

type UserFormProps = {
  data?: UserProps;
  onFinish: () => void;
};

export const UserForm: FC<UserFormProps> = ({ data, onFinish }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserFormParams>();
  const goBack = useGoBack();
  const isUpdate = hash === modalKeys.update && !!data;

  const handleSubmit = async ({
    firstName,
    lastName,
    mobile,
    password,
    personnelCode,
  }: UserFormParams) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const profile = { firstName, lastName, mobile, personnelCode };

      if (isUpdate) {
        await updateUser(data.id, profile satisfies UpdateUserParams);
      } else {
        await createUser({ ...profile, password });
      }

      messageAPI.success(t(isUpdate ? "userUpdated" : "userCreated"));
      goBack();
      onFinish();
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    switch (hash) {
      case modalKeys.create: {
        setOpen(true);
        break;
      }
      case modalKeys.update: {
        if (data) {
          setOpen(true);
          form.setFieldsValue(data);
        } else {
          goBack();
        }
        break;
      }
      default: {
        if (open) form.resetFields();
        setOpen(false);
        setSubmitting(false);
      }
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
      title={t(isUpdate ? "update" : "create")}
    >
      <Form<UserFormParams>
        form={form}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
      >
        <Form.Item
          label={t("firstName")}
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("lastName")}
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("mobile")}
          name="mobile"
          rules={[{ required: true }]}
        >
          <DigitsInput style={{ direction: "ltr" }} />
        </Form.Item>
        <Form.Item
          label={t("personnelCode")}
          name="personnelCode"
          rules={[{ required: true }]}
        >
          <Input style={{ direction: "ltr" }} />
        </Form.Item>
        {!isUpdate && <PasswordFields />}
      </Form>
    </Drawer>
  );
};
