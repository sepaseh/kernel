import { Button, Drawer, Form, FormProps, Select, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { updateUserRoles } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { RoleProps, UserProps, UserRoleParams } from "@/types";

type StateProps = {
  open?: boolean;
  submitting?: boolean;
};

type UserFormRoleProps = {
  data?: UserProps;
  onFinish: () => void;
  options: { roles: RoleProps[] };
};

export const UserFormRole: FC<UserFormRoleProps> = ({
  data,
  onFinish,
  options: { roles },
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const { open, submitting } = state;
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserRoleParams>();
  const goBack = useGoBack();

  const handleSubmit: FormProps<UserRoleParams>["onFinish"] = async (
    values,
  ) => {
    if (submitting || !data) return;

    try {
      setState((prevState) => ({ ...prevState, submitting: true }));

      const { message } = await updateUserRoles(data.id, values);

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
        case modalKeys.roles: {
          if (data) {
            setState((prevState) => ({ ...prevState, open: true }));

            form.setFieldsValue({ roleIds: data.roles.map(({ id }) => id) });
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
      title={t("roles")}
      styles={{ footer: { textAlign: "end" } }}
    >
      <Form<UserRoleParams>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item<UserRoleParams> label={t("roles")} name="roleIds">
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
