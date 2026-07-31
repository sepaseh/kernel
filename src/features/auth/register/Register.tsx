import { Button, Flex, Form, FormProps, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { routeTree } from "@/config";
import { register, requestOtp } from "@/features/auth/api";
import { useAntd } from "@/hooks";
import { getErrorMessage } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { Icon } from "@/shared/ui/icon";
import { OtpInput } from "@/shared/ui/otp-input";
import { PasswordFields } from "@/shared/ui/password-fields";
import { RegisterParams } from "@/types";

type RegisterFormParams = RegisterParams & {
  confirmPassword: string;
};

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const [form] = Form.useForm<RegisterFormParams>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!remainingSeconds) return;

    const timeout = window.setTimeout(
      () => setRemainingSeconds((seconds) => seconds - 1),
      1000,
    );

    return () => window.clearTimeout(timeout);
  }, [remainingSeconds]);

  const handleOtpRequest = async () => {
    if (requestingOtp || remainingSeconds) return;

    try {
      const { mobile } = await form.validateFields(["mobile"]);

      setRequestingOtp(true);

      const response = await requestOtp({ mobile, purpose: "register" });

      setRemainingSeconds(response.remainingSeconds);
      messageAPI.success(t("otpSent"));
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSubmit = async ({
    firstName,
    lastName,
    mobile,
    otp,
    password,
  }: RegisterFormParams) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      await register({ firstName, lastName, mobile, otp, password });

      navigate(routeTree.root.path, { replace: true });
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit: NonNullable<
    FormProps<RegisterFormParams>["onFinish"]
  > = (values) => {
    void handleSubmit(values);
  };

  return (
    <Flex gap={32} vertical>
      <Flex align="center" gap={8} vertical>
        <Icon name="user" size={28} />
        <Typography.Title level={1} style={{ fontSize: 16 }}>
          {t("register")}
        </Typography.Title>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        requiredMark={false}
        scrollToFirstError
      >
        <Flex gap={8}>
          <Form.Item<RegisterFormParams>
            label={t("firstName")}
            name="firstName"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Input placeholder={t("firstName")} size="large" />
          </Form.Item>
          <Form.Item<RegisterFormParams>
            label={t("lastName")}
            name="lastName"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Input placeholder={t("lastName")} size="large" />
          </Form.Item>
        </Flex>
        <Form.Item<RegisterFormParams>
          label={t("mobile")}
          name="mobile"
          rules={[{ required: true }]}
        >
          <DigitsInput
            placeholder={t("mobile")}
            size="large"
            style={{ direction: "ltr" }}
          />
        </Form.Item>
        <Form.Item label={t("otp")} required>
          <Flex gap={8}>
            <Form.Item<RegisterFormParams>
              name="otp"
              noStyle
              rules={[{ required: true }]}
            >
              <OtpInput length={6} size="large" style={{ direction: "ltr" }} />
            </Form.Item>
            <Button
              disabled={Boolean(remainingSeconds)}
              loading={requestingOtp}
              onClick={() => void handleOtpRequest()}
              size="large"
            >
              {remainingSeconds || t("requestOtp")}
            </Button>
          </Flex>
        </Form.Item>
        <PasswordFields size="large" />
      </Form>
      <Button
        block
        loading={submitting}
        onClick={() => form.submit()}
        size="large"
        type="primary"
      >
        {t("register")}
      </Button>
      <Flex justify="center">
        <Link to={routeTree.auth.path}>{t("backToLogin")}</Link>
      </Flex>
    </Flex>
  );
};
