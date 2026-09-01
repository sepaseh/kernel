import { Checkbox, Divider, Flex, Form, Input } from "antd";
import { type FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { createRole, updateRole } from "@/features/roles/api";
import { roleDrawerKeys } from "@/features/roles/constants";
import type {
  PermissionGroup,
  Role,
  RoleRequest,
} from "@/features/roles/types";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";

type RoleFormProps = {
  data?: Role;
  onFinish: () => void;
  options: { permissions: PermissionGroup[] };
};

export const RoleForm: FC<RoleFormProps> = ({
  data,
  onFinish,
  options: { permissions },
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<RoleRequest>();
  const goBack = useGoBack();
  const isUpdate = hash === roleDrawerKeys.update && !!data;
  const open = hash === roleDrawerKeys.create || isUpdate;

  const handleSubmit = async (values: RoleRequest) => {
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
    if (hash === roleDrawerKeys.update && !data) goBack();
  }, [data, goBack, hash]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (isUpdate && data) {
      form.setFieldsValue({
        name: data.name,
        permissions: data.permissions,
      });
    } else {
      form.resetFields();
    }
  }, [data, form, isUpdate, open]);

  return (
    <FormDrawer
      afterOpenChange={(isOpen) => {
        if (isOpen) form.focusField("name");
        else setSubmitting(false);
      }}
      autoFocus={false}
      onClose={() => goBack()}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
      title={t(isUpdate ? "update" : "create")}
    >
      <Form<RoleRequest>
        form={form}
        initialValues={{ permissions: [] }}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
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
    </FormDrawer>
  );
};
