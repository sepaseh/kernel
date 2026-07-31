import { Button, Flex, Form, FormProps, Input, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useAntd } from "@/app/hooks";
import { routeTree } from "@/config";
import { login } from "@/features/auth/api";
import { LoginParams } from "@/features/auth/types";
import { getErrorMessage } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

export const LoginPage = () => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const [form] = Form.useForm<LoginParams>();
  const navigate = useNavigate();

  const submit = async (values: LoginParams) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      await login(values);

      navigate(routeTree.root.path, { replace: true });
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit: NonNullable<FormProps<LoginParams>["onFinish"]> = (
    values,
  ) => {
    void submit(values);
  };

  const handleSubmitTrigger = () => {
    form.submit();
  };

  return (
    <Flex gap={32} vertical>
      <Flex align="center" gap={8} vertical>
        <Icon name="bolt" size={28} />
        <Typography.Title level={1} style={{ fontSize: 16 }}>
          {t("login")}
        </Typography.Title>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        scrollToFirstError
      >
        <Form.Item<LoginParams>
          label={t("identifier")}
          name="identifier"
          rules={[{ required: true }]}
        >
          <Input
            onPressEnter={handleSubmitTrigger}
            placeholder={t("identifier")}
            size="large"
            style={{ direction: "ltr" }}
          />
        </Form.Item>
        <Form.Item<LoginParams>
          label={t("password")}
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password
            onPressEnter={handleSubmitTrigger}
            placeholder={t("password")}
            size="large"
            styles={{ input: { direction: "ltr" } }}
            type="password"
          />
        </Form.Item>
        <Flex justify="space-between">
          <Link to={routeTree.register.path}>{t("createAccount")}</Link>
          <Link to={routeTree.forgotPassword.path}>{t("forgotPassword")}</Link>
        </Flex>
      </Form>
      <Button
        type="primary"
        size="large"
        loading={submitting}
        onClick={handleSubmitTrigger}
        block
      >
        {t("enter")}
      </Button>
    </Flex>
  );
};
