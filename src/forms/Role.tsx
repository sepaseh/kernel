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
  Tooltip,
} from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { createRole, updateRole } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { PermissionProps, RoleProps } from "@/types";

type StateProps = {
  open?: boolean;
  submitting?: boolean;
};

export const RoleForm: FC<{
  data?: RoleProps;
  onFinish: () => void;
  options: { permissions: PermissionProps[] };
}> = ({ data, onFinish, options: { permissions } }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const { open, submitting } = state;
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<RoleProps>();
  const goBack = useGoBack();
  const isUpdate = hash === modalKeys.update && !!data;

  const groups = useMemo(() => {
    return Object.values(
      permissions.reduce(
        (acc, { description, groupName, groupTitle, name, title }) => {
          if (!acc[groupName]) {
            acc[groupName] = { label: groupTitle, options: [] };
          }

          acc[groupName].options.push({ description, name, title });

          return acc;
        },
        {} as Record<
          string,
          {
            label: string;
            options: Pick<PermissionProps, "description" | "name" | "title">[];
          }
        >,
      ),
    );
  }, [permissions]);

  const handleSubmit: FormProps<RoleProps>["onFinish"] = async (values) => {
    if (submitting) return;

    try {
      setState((prevState) => ({ ...prevState, submitting: true }));

      const { message } = isUpdate
        ? await updateRole(data.id, values)
        : await createRole(values);

      messageAPI.success(message);

      goBack();

      onFinish();
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
    } finally {
      setState((prevState) => ({ ...prevState, submitting: false }));
    }
  };

  useEffect(() => {
    void (() => {
      switch (hash) {
        case modalKeys.create: {
          setState((prevState) => ({ ...prevState, open: true }));

          break;
        }
        case modalKeys.update: {
          if (data) {
            setState((prevState) => ({ ...prevState, open: true }));

            form.setFieldsValue(data);
          } else {
            goBack();
          }

          break;
        }
        default: {
          if (open) form.resetFields();

          setState({});

          break;
        }
      }
    })();
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
      <Form<RoleProps> form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item<RoleProps>
          label={t("name")}
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<RoleProps> label={t("description")} name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item<RoleProps> label={t("permissions")} name="permissions">
          <Checkbox.Group
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {groups.map(({ label, options }, index) => (
              <Flex gap={8} key={index} vertical>
                <Divider
                  titlePlacement="start"
                  variant="dashed"
                  styles={{
                    content: { fontSize: 14, fontWeight: 400 },
                    root: { margin: 0 },
                  }}
                >
                  {label}
                </Divider>
                {options.map(({ description, name, title }) => (
                  <Tooltip key={name} title={description}>
                    <Checkbox value={name}>{title}</Checkbox>
                  </Tooltip>
                ))}
              </Flex>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
