/* eslint-disable react-hooks/set-state-in-effect */
import { Form } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { updateUserPassword } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";
import { PasswordFields } from "@/shared/ui/password-fields";
import { UserPasswordParams, UserProps } from "@/types";

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
    <FormDrawer
      onClose={goBack}
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
