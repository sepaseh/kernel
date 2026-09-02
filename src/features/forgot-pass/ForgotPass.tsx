import type { FormProps } from "antd";
import { Button, Flex, Form, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { routeTree } from "@/app/config";
import { useAntd } from "@/app/hooks";
import {
  forgotPassword,
  type ForgotPasswordParams,
  requestOtp,
} from "@/features/auth";
import { getErrorMessage } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { Icon } from "@/shared/ui/icon";
import { OtpInput } from "@/shared/ui/otp-input";
import { PasswordFields } from "@/shared/ui/password-fields";

type ForgotPasswordFormParams = ForgotPasswordParams & {
  confirmPassword: string;
};

export const ForgotPassPage = () => {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const [form] = Form.useForm<ForgotPasswordFormParams>();
  const navigate = useNavigate();

  const handleOtpRequest = async () => {
    if (requestingOtp || remainingSeconds) return;

    try {
      const mobile = await form.validateFields(["mobile"]);
      setRequestingOtp(true);
      const response = await requestOtp({
        mobile: mobile.mobile,
        purpose: "forgot_password",
      });
      setRemainingSeconds(response.remainingSeconds);
      messageAPI.success(t("otpSent"));
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSubmit: FormProps<ForgotPasswordFormParams>["onFinish"] = async ({
    mobile,
    otp,
    password,
  }) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await forgotPassword({ mobile, otp, password });
      messageAPI.success(t("passwordReset"));
      navigate(routeTree.auth.path, { replace: true });
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!remainingSeconds) return;

    const timeout = window.setTimeout(
      () => setRemainingSeconds((seconds) => seconds - 1),
      1000,
    );

    return () => window.clearTimeout(timeout);
  }, [remainingSeconds]);

  return (
    <Flex gap={32} vertical>
      <Flex align="center" gap={8} vertical>
        <Icon name="lock" size={28} />
        <Typography.Title level={1} style={{ fontSize: 16 }}>
          {t("forgotPassword")}
        </Typography.Title>
      </Flex>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        scrollToFirstError
      >
        <Form.Item<ForgotPasswordFormParams>
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
            <Form.Item<ForgotPasswordFormParams>
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
        <PasswordFields passwordLabel="newPass" size="large" />
      </Form>
      <Button
        block
        loading={submitting}
        onClick={() => form.submit()}
        size="large"
        type="primary"
      >
        {t("submit")}
      </Button>
      <Flex justify="center">
        <Link to={routeTree.auth.path}>{t("backToLogin")}</Link>
      </Flex>
    </Flex>
  );
};
