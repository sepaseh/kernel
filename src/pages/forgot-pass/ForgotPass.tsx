import { Button, Flex, Form, FormProps, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { forgotPassword, requestOtp } from "@/api";
import { DigitsInput } from "@/components/digits-input";
import { Icon } from "@/components/icon";
import { OtpInput } from "@/components/otp-input";
import { routeTree } from "@/config";
import { useAntd } from "@/hooks";
import { ForgotPasswordParams } from "@/types";
import { getErrorMessage } from "@/utils";

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

  const handleSubmit = async ({
    mobile,
    otp,
    password,
  }: ForgotPasswordFormParams) => {
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

  const handleFormSubmit: NonNullable<
    FormProps<ForgotPasswordFormParams>["onFinish"]
  > = (values) => {
    void handleSubmit(values);
  };

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
        onFinish={handleFormSubmit}
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
        <Form.Item<ForgotPasswordFormParams>
          label={t("newPass")}
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password
            placeholder={t("newPass")}
            size="large"
            styles={{ input: { direction: "ltr" } }}
          />
        </Form.Item>
        <Form.Item<ForgotPasswordFormParams>
          dependencies={["password"]}
          label={t("confirmPass")}
          name="confirmPassword"
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error(t("passsMismatch")));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder={t("confirmPass")}
            size="large"
            styles={{ input: { direction: "ltr" } }}
          />
        </Form.Item>
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
