import { Form, type FormProps, Input } from "antd";
import { type FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { createUser, updateUser } from "@/features/users/api";
import { userDrawerKeys } from "@/features/users/constants";
import type { User, UserRequest } from "@/features/users/types";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage, tinyId } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { FormDrawer } from "@/shared/ui/form-drawer";

type UserFormProps = {
  data?: User;
  onFinish: () => void;
};

export const UserForm: FC<UserFormProps> = ({ data, onFinish }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI, notificationAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserRequest>();
  const goBack = useGoBack();
  const isUpdate = hash === userDrawerKeys.update && !!data;
  const open = hash === userDrawerKeys.create || isUpdate;

  const handleSubmit: FormProps<UserRequest>["onFinish"] = async (values) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      if (isUpdate) {
        await updateUser(data.id, values);
      } else {
        const password = tinyId();
        await createUser({ ...values, password });
        void navigator.clipboard?.writeText(password).catch(() => undefined);
        notificationAPI.success({
          description: password,
          message: t("password"),
        });
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
    if (hash === userDrawerKeys.update && !data) goBack();
  }, [data, goBack, hash]);

  return (
    <FormDrawer
      afterOpenChange={(isOpen) => {
        if (isOpen) {
          if (isUpdate) {
            form.setFieldsValue({
              firstName: data.firstName,
              lastName: data.lastName,
              mobile: data.mobile,
            });
          }
          form.focusField("firstName");
        } else {
          form.resetFields();
        }
      }}
      onClose={() => goBack()}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
      title={t(isUpdate ? "update" : "create")}
    >
      <Form<UserRequest>
        form={form}
        initialValues={isUpdate ? data : undefined}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item<UserRequest>
          label={t("firstName")}
          name="firstName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserRequest>
          label={t("lastName")}
          name="lastName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<UserRequest>
          label={t("mobile")}
          name="mobile"
          rules={[{ required: true }]}
        >
          <DigitsInput />
        </Form.Item>
      </Form>
    </FormDrawer>
  );
};
