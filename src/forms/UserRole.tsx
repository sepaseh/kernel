/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, FormProps, Select, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { updateUserRoles } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { UserOptionProps, UserProps, UserRoleParams } from "@/types";
import { getErrorMessage } from "@/utils";

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

  const handleSubmit: FormProps<UserRoleParams>["onFinish"] = async (
    values,
  ) => {
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
      title={t("roles")}
      styles={{ footer: { textAlign: "end" } }}
    >
      <Form<UserRoleParams>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
    </Drawer>
  );
};
