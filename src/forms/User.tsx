/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, FormProps, Input, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { createUser, updateUser } from "@/api";
import { DigitsInput } from "@/components/DigitsInput";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { CreateUserParams, UpdateUserParams, UserProps } from "@/types";
import { getErrorMessage } from "@/utils";

type UserFormParams = CreateUserParams & {
  confirmPassword: string;
};

export const UserForm: FC<{ data?: UserProps; onFinish: () => void }> = ({
  data,
  onFinish,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserFormParams>();
  const goBack = useGoBack();
  const isUpdate = hash === modalKeys.update && !!data;

  const handleSubmit: FormProps<UserFormParams>["onFinish"] = async ({
    firstName,
    lastName,
    mobile,
    password,
    personnelCode,
  }) => {
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
      title={t(isUpdate ? "update" : "create")}
      styles={{ footer: { textAlign: "end" } }}
    >
      <Form<UserFormParams>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
        {!isUpdate && (
          <>
            <Form.Item
              label={t("password")}
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
          </>
        )}
      </Form>
    </Drawer>
  );
};
