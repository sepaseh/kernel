/* eslint-disable react-hooks/set-state-in-effect */
import { Form, Select } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { useAntd } from "@/app/hooks";
import { updateUserWorkspaces } from "@/features/users/api";
import {
  UserOptionProps,
  UserProps,
  UserWorkspaceParams,
} from "@/features/users/types";
import { modalKeys } from "@/shared/config";
import { useGoBack } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { FormDrawer } from "@/shared/ui/form-drawer";

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

  const handleSubmit = async (values: UserWorkspaceParams) => {
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
    <FormDrawer
      onClose={goBack}
      onSubmit={() => form.submit()}
      open={open}
      submitting={submitting}
      title={t("workspaces")}
    >
      <Form<UserWorkspaceParams>
        form={form}
        layout="vertical"
        onFinish={(values) => void handleSubmit(values)}
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
    </FormDrawer>
  );
};
