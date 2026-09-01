import { Form, Input } from "antd";
import { type FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { createUser, updateUser } from "@/features/users/api";
import { userDrawerKeys } from "@/features/users/constants";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "@/features/users/types";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { FormDrawer } from "@/shared/ui/form-drawer";
import { PasswordFields } from "@/shared/ui/password-fields";

type UserFormParams = CreateUserRequest & {
  confirmPassword: string;
};

type UserFormProps = {
  data?: User;
  onFinish: () => void;
};

export const UserForm: FC<UserFormProps> = ({ data, onFinish }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserFormParams>();
  const goBack = useGoBack();
  const isUpdate = hash === userDrawerKeys.update && !!data;
  const open = hash === userDrawerKeys.create || isUpdate;

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
        await updateUser(data.id, profile satisfies UpdateUserRequest);
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
    if (hash === userDrawerKeys.update && !data) goBack();
  }, [data, goBack, hash]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (isUpdate && data) {
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        personnelCode: data.personnelCode,
      });
    } else {
      form.resetFields();
    }
  }, [data, form, isUpdate, open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) form.focusField("firstName");
    else setSubmitting(false);
  };

  return (
    <FormDrawer
      afterOpenChange={handleOpenChange}
      autoFocus={false}
      onClose={() => goBack()}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
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
    </FormDrawer>
  );
};
