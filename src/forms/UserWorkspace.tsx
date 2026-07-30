/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Form, FormProps, Select, Space } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { updateUserWorkspaces } from "@/api";
import { modalKeys } from "@/config";
import { useAntd, useGoBack } from "@/hooks";
import { UserOptionProps, UserProps, UserWorkspaceParams } from "@/types";
import { getErrorMessage } from "@/utils";

type UserWorkspaceFormProps = {
  data?: UserProps;
  onFinish: () => void;
  options: { workspaces: UserOptionProps[] };
};

export const UserWorkspaceForm: FC<UserWorkspaceFormProps> = ({
  data,
  onFinish,
  options: { workspaces },
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { hash } = useLocation();
  const [form] = Form.useForm<UserWorkspaceParams>();
  const goBack = useGoBack();

  const handleSubmit: FormProps<UserWorkspaceParams>["onFinish"] = async (
    values,
  ) => {
    if (submitting || !data) return;

    try {
      setSubmitting(true);
      await updateUserWorkspaces(data.id, values);
      messageAPI.success(t("workspacesUpdated"));
      goBack();
      onFinish();
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hash === modalKeys.workspaces) {
      if (data) {
        setOpen(true);
        form.setFieldsValue({ workspaceIds: data.workspaceIds });
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
      title={t("workspaces")}
      styles={{ footer: { textAlign: "end" } }}
    >
      <Form<UserWorkspaceParams>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label={t("workspaces")} name="workspaceIds">
          <Select
            mode="multiple"
            options={workspaces.map(({ id, name }) => ({
              label: name,
              value: id,
            }))}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
