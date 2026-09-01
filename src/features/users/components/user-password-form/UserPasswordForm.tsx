import { Form } from "antd";
import { type FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { updateUserPassword } from "@/features/users/api";
import { userDrawerKeys } from "@/features/users/constants";
import type { User, UserPasswordRequest } from "@/features/users/types";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";
import { PasswordFields } from "@/shared/ui/password-fields";

type UserPasswordFormParams = UserPasswordRequest & {
  confirmPassword: string;
};

type UserPasswordFormProps = {
  data?: User;
};

export const UserPasswordForm: FC<UserPasswordFormProps> = ({ data }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserPasswordFormParams>();
  const goBack = useGoBack();
  const open = hash === userDrawerKeys.password && !!data;

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
    if (hash === userDrawerKeys.password && !data) goBack();
  }, [data, goBack, hash]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }
  }, [form, open]);

  return (
    <FormDrawer
      afterOpenChange={(isOpen) => {
        if (isOpen) form.focusField("password");
        else setSubmitting(false);
      }}
      autoFocus={false}
      onClose={() => goBack()}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
      title={t("changePassword")}
    >
      <Form<UserPasswordFormParams>
        form={form}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
      >
        <PasswordFields passwordLabel="newPass" />
      </Form>
    </FormDrawer>
  );
};
