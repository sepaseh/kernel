import { Form, Select } from "antd";
import { type FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { updateUserRoles } from "@/features/users/api";
import { userDrawerKeys } from "@/features/users/constants";
import type { User, UserOption, UserRoleRequest } from "@/features/users/types";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";

type UserRoleFormProps = {
  data?: User;
  onFinish: () => void;
  options: { roles: UserOption[] };
};

export const UserRoleForm: FC<UserRoleFormProps> = ({
  data,
  onFinish,
  options: { roles },
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserRoleRequest>();
  const goBack = useGoBack();
  const open = hash === userDrawerKeys.roles && !!data;

  const handleSubmit = async (values: UserRoleRequest) => {
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
    if (hash === userDrawerKeys.roles && !data) goBack();
  }, [data, goBack, hash]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (data) form.setFieldsValue({ roleIds: data.roleIds });
  }, [data, form, open]);

  return (
    <FormDrawer
      afterOpenChange={(isOpen) => {
        if (isOpen) form.focusField("roleIds");
        else setSubmitting(false);
      }}
      autoFocus={false}
      onClose={() => goBack()}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
      title={t("roles")}
    >
      <Form<UserRoleRequest>
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
