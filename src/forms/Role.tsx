/* eslint-disable react-hooks/set-state-in-effect */
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Flex,
  Form,
  FormProps,
  Input,
  Space,
} from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { createRole, updateRole } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { PermissionGroupProps, RoleMutationParams, RoleProps } from "@/types";
import { getErrorMessage } from "@/utils";

export const RoleForm: FC<{
  data?: RoleProps;
  onFinish: () => void;
  options: { permissions: PermissionGroupProps[] };
}> = ({ data, onFinish, options: { permissions } }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<RoleMutationParams>();
  const goBack = useGoBack();
  const isUpdate = hash === modalKeys.update && !!data;

  const handleSubmit: FormProps<RoleMutationParams>["onFinish"] = async (
    values,
  ) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      if (isUpdate) await updateRole(data.id, values);
      else await createRole(values);
      messageAPI.success(t(isUpdate ? "roleUpdated" : "roleCreated"));
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
      case modalKeys.create:
        setOpen(true);
        break;
      case modalKeys.update:
        if (data) {
          setOpen(true);
          form.setFieldsValue({
            name: data.name,
            permissions: data.permissions,
          });
        } else {
          goBack();
        }
        break;
      default:
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
      styles={{ footer: { textAlign: "end" } }}
      title={t(isUpdate ? "update" : "create")}
    >
      <Form<RoleMutationParams>
        form={form}
        initialValues={{ permissions: [] }}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label={t("name")} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("permissions")} name="permissions">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {permissions.map((group) => (
              <Flex gap={8} key={group.name} vertical>
                <Divider
                  styles={{
                    content: { fontSize: 14, fontWeight: 400 },
                    root: { margin: 0 },
                  }}
                  titlePlacement="start"
                  variant="dashed"
                >
                  {group.title}
                </Divider>
                {group.permissions.map((permission) => (
                  <Checkbox key={permission.name} value={permission.name}>
                    {permission.title}
                  </Checkbox>
                ))}
              </Flex>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
