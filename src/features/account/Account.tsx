import type { FormProps } from "antd";
import { Button, Card, Col, Flex, Form, Input, Row } from "antd";
import { useAntdToken } from "antd-style";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import type { ChangePasswordParams } from "@/features/auth";
import { changePassword } from "@/features/auth";
import { getErrorMessage } from "@/shared/lib";
import { OtpInput } from "@/shared/ui/otp-input";

import {
  getAccount,
  requestEmailVerification,
  updateProfile,
  updateUsername,
  verifyEmail,
} from "./api";
import type {
  Account,
  UpdateProfileRequest,
  UpdateUsernameRequest,
  VerifyEmailRequest,
} from "./types";

type ProfileFormParams = UpdateProfileRequest & Pick<Account, "mobile">;

type PasswordFormParams = ChangePasswordParams & {
  confirmPassword: string;
};

export const AccountPage = () => {
  const { t } = useTranslation();
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [otpRemainingSeconds, setOtpRemainingSeconds] = useState(0);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { setUser, user } = useCore();
  const [emailForm] = Form.useForm<VerifyEmailRequest>();
  const [passwordForm] = Form.useForm<PasswordFormParams>();
  const [profileForm] = Form.useForm<ProfileFormParams>();
  const [usernameForm] = Form.useForm<UpdateUsernameRequest>();
  const token = useAntdToken();

  const handleProfileSubmit: FormProps<ProfileFormParams>["onFinish"] = async ({
    firstName,
    lastName,
  }) => {
    if (profileSubmitting) return;

    try {
      setProfileSubmitting(true);
      setUser(await updateProfile({ firstName, lastName }));
      messageAPI.success(t("profileUpdated"));
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleUsernameSubmit: FormProps<UpdateUsernameRequest>["onFinish"] =
    async (values) => {
      if (usernameSubmitting) return;

      try {
        setUsernameSubmitting(true);
        setUser(await updateUsername(values));
        messageAPI.success(t("usernameUpdated"));
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      } finally {
        setUsernameSubmitting(false);
      }
    };

  const handleEmailVerificationRequest = async () => {
    if (otpSubmitting || otpRemainingSeconds) return;

    try {
      const { email } = await emailForm.validateFields(["email"]);
      setOtpSubmitting(true);
      const { remainingSeconds } = await requestEmailVerification({ email });
      setOtpRemainingSeconds(remainingSeconds);
      messageAPI.success(t("otpSent"));
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleEmailSubmit: FormProps<VerifyEmailRequest>["onFinish"] = async (
    values,
  ) => {
    if (emailSubmitting) return;

    try {
      setEmailSubmitting(true);
      await verifyEmail(values);
      setUser(await getAccount());
      emailForm.setFieldValue("otp", "");
      messageAPI.success(t("emailUpdated"));
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handlePasswordSubmit: FormProps<PasswordFormParams>["onFinish"] =
    async ({ currentPassword, newPassword }) => {
      if (passwordSubmitting) return;

      try {
        setPasswordSubmitting(true);
        await changePassword({ currentPassword, newPassword });
        messageAPI.success(t("passwordChanged"));
        passwordForm.resetFields();
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      } finally {
        setPasswordSubmitting(false);
      }
    };

  useEffect(() => {
    if (!otpRemainingSeconds) return;

    const timeout = window.setTimeout(
      () => setOtpRemainingSeconds((seconds) => seconds - 1),
      1000,
    );

    return () => window.clearTimeout(timeout);
  }, [otpRemainingSeconds]);

  if (!user) return null;

  return (
    <Row>
      <Col xs={24} lg={12} xl={8} xxl={6}>
        <Flex gap={token.marginMD} vertical>
          <Card title={t("basicInfo")} variant="borderless">
            <Form<ProfileFormParams>
              form={profileForm}
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
              }}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                label={t("firstName")}
                name="firstName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("lastName")}
                name="lastName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t("mobile")}
                name="mobile"
                rules={[{ required: true }]}
              >
                <Input disabled style={{ direction: "ltr" }} />
              </Form.Item>
              <Flex justify="flex-end">
                <Button
                  htmlType="submit"
                  loading={profileSubmitting}
                  type="primary"
                >
                  {t("update")}
                </Button>
              </Flex>
            </Form>
          </Card>
          <Card title={t("username")} variant="borderless">
            <Form<UpdateUsernameRequest>
              form={usernameForm}
              initialValues={{ username: user.username ?? undefined }}
              layout="vertical"
              onFinish={handleUsernameSubmit}
            >
              <Form.Item
                label={t("username")}
                name="username"
                rules={[{ required: true }]}
              >
                <Input style={{ direction: "ltr" }} />
              </Form.Item>
              <Flex justify="flex-end">
                <Button
                  htmlType="submit"
                  loading={usernameSubmitting}
                  type="primary"
                >
                  {t("update")}
                </Button>
              </Flex>
            </Form>
          </Card>
          <Card title={t("email")} variant="borderless">
            <Form<VerifyEmailRequest>
              form={emailForm}
              initialValues={{ email: user.email ?? undefined }}
              layout="vertical"
              onFinish={handleEmailSubmit}
            >
              <Form.Item
                label={t("email")}
                name="email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label={t("otp")} required>
                <Flex gap={token.marginXS}>
                  <Form.Item name="otp" noStyle rules={[{ required: true }]}>
                    <OtpInput length={6} style={{ direction: "ltr" }} />
                  </Form.Item>
                  <Button
                    disabled={Boolean(otpRemainingSeconds)}
                    loading={otpSubmitting}
                    onClick={handleEmailVerificationRequest}
                  >
                    {otpRemainingSeconds || t("requestOtp")}
                  </Button>
                </Flex>
              </Form.Item>
              <Flex justify="flex-end">
                <Button
                  htmlType="submit"
                  loading={emailSubmitting}
                  type="primary"
                >
                  {t("verifyEmail")}
                </Button>
              </Flex>
            </Form>
          </Card>
          <Card title={t("changePassword")} variant="borderless">
            <Form<PasswordFormParams>
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                label={t("currentPass")}
                name="currentPassword"
                rules={[{ required: true }]}
              >
                <Input.Password styles={{ input: { direction: "ltr" } }} />
              </Form.Item>
              <Form.Item
                label={t("newPass")}
                name="newPassword"
                rules={[{ required: true }]}
              >
                <Input.Password styles={{ input: { direction: "ltr" } }} />
              </Form.Item>
              <Form.Item
                dependencies={["newPassword"]}
                label={t("confirmPass")}
                name="confirmPassword"
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error(t("passsMismatch")));
                    },
                  }),
                ]}
              >
                <Input.Password styles={{ input: { direction: "ltr" } }} />
              </Form.Item>
              <Flex justify="flex-end">
                <Button
                  htmlType="submit"
                  loading={passwordSubmitting}
                  type="primary"
                >
                  {t("changePassword")}
                </Button>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Col>
    </Row>
  );
};
