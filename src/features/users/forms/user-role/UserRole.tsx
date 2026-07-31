/* eslint-disable react-hooks/set-state-in-effect */
import { Form, Select } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { modalKeys } from "@/config";
import { updateUserRoles } from "@/features/users/api";
import {
  UserOptionProps,
  UserProps,
  UserRoleParams,
} from "@/features/users/types";
import { useAntd, useGoBack } from "@/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";

type UserFormRoleProps = {
  data?: UserProps;
  onFinish: () => void;
  options: { roles: UserOptionProps[] };
};

export const UserFormRole: FC<UserFormRoleProps> = ({
  data,
  onFinish,
  options: { roles },
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserRoleParams>();
  const goBack = useGoBack();

  const handleSubmit = async (values: UserRoleParams) => {
    if (submitting || !data) return;

    try {
      setSubmitting(true);
      await updateUserRoles(data.id, values);
      messageAPI.success(t("rolesUpdated"));
      goBack();
      onFinish();
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hash === modalKeys.roles) {
      if (data) {
        setOpen(true);
        form.setFieldsValue({ roleIds: data.roleIds });
      } else {
        goBack();
      }
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
      title={t("roles")}
    >
      <Form<UserRoleParams>
        form={form}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
      >
        <Form.Item label={t("roles")} name="roleIds">
          <Select
            mode="multiple"
            options={roles.map(({ id, name }) => ({
              label: name,
              value: id,
            }))}
          />
        </Form.Item>
      </Form>
    </FormDrawer>
  );
};
