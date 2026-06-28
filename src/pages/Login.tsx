import { Button, Flex, Form, FormProps, Input, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { login } from "@/api";
import { Icon } from "@/components/Icon";
import { authTokenKey, routeTree } from "@/config";
import { useAntd } from "@/hooks";
import { LoginParams } from "@/types";
import { setCookie } from "@/utils";

export const LoginPage = () => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const [form] = Form.useForm<LoginParams>();
  const navigate = useNavigate();

  const handleSubmit: FormProps<LoginParams>["onFinish"] = async (values) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const { sessionToken } = await login(values);

      setCookie(authTokenKey, sessionToken);

      navigate(routeTree.root.path, { replace: true });
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTrigger = () => {
    form.submit();
  };

  return (
    <Flex gap={32} vertical>
      <Flex align="center" gap={8} vertical>
        <Icon name="bolt" size={28} />
        <Typography.Title level={5}>{t("login")}</Typography.Title>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        scrollToFirstError
      >
        <Form.Item<LoginParams>
          label={t("username")}
          name="username"
          rules={[{ required: true }]}
        >
          <Input
            onPressEnter={handleSubmitTrigger}
            placeholder={t("username")}
            size="large"
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
            type="password"
          />
        </Form.Item>
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
