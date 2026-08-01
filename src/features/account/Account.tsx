import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  FormProps,
  Input,
  Row,
  Typography,
} from "antd";
import { useAntdToken } from "antd-style";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import { changePassword, ChangePasswordParams } from "@/features/auth";
import { getErrorMessage } from "@/shared/lib";
import { OtpInput } from "@/shared/ui/otp-input";

import {
  getAccount,
  requestEmailVerification,
  updateProfile,
  updateUsername,
  verifyEmail,
} from "./api";
import {
  UpdateProfileParams,
  UpdateUsernameParams,
  VerifyEmailParams,
} from "./types";

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
  const token = useAntdToken();
  const [emailForm] = Form.useForm<VerifyEmailParams>();
  const [passwordForm] = Form.useForm<PasswordFormParams>();
  const [profileForm] = Form.useForm<UpdateProfileParams>();
  const [usernameForm] = Form.useForm<UpdateUsernameParams>();

  useEffect(() => {
    if (!otpRemainingSeconds) return;

    const timeout = window.setTimeout(
      () => setOtpRemainingSeconds((seconds) => seconds - 1),
      1000,
    );

    return () => window.clearTimeout(timeout);
  }, [otpRemainingSeconds]);

  if (!user) return null;

  const showError = (error: unknown) => {
    messageAPI.error(getErrorMessage(error));
  };

  const submitProfile = async (values: UpdateProfileParams) => {
    if (profileSubmitting) return;

    try {
      setProfileSubmitting(true);

      const account = await updateProfile(values);

      setUser(account);
      messageAPI.success(t("profileUpdated"));
    } catch (error) {
      showError(error);
    } finally {
      setProfileSubmitting(false);
    }
  };

  const submitUsername = async (values: UpdateUsernameParams) => {
    if (usernameSubmitting) return;

    try {
      setUsernameSubmitting(true);

      const account = await updateUsername(values);

      setUser(account);
      messageAPI.success(t("usernameUpdated"));
    } catch (error) {
      showError(error);
    } finally {
      setUsernameSubmitting(false);
    }
  };

  const handleEmailVerificationRequest = async () => {
    if (otpSubmitting || otpRemainingSeconds) return;

    try {
      const { email } = await emailForm.validateFields(["email"]);

      setOtpSubmitting(true);

      const response = await requestEmailVerification({ email });

      setOtpRemainingSeconds(response.remainingSeconds);
      messageAPI.success(t("otpSent"));
    } catch (error) {
      showError(error);
    } finally {
      setOtpSubmitting(false);
    }
  };

  const submitEmail = async (values: VerifyEmailParams) => {
    if (emailSubmitting) return;

    try {
      setEmailSubmitting(true);

      await verifyEmail(values);

      const account = await getAccount();

      setUser(account);
      emailForm.setFieldValue("otp", "");
      messageAPI.success(t("emailUpdated"));
    } catch (error) {
      showError(error);
    } finally {
      setEmailSubmitting(false);
    }
  };

  const submitPassword = async ({
    currentPassword,
    newPassword,
  }: PasswordFormParams) => {
    if (passwordSubmitting) return;

    try {
      setPasswordSubmitting(true);

      await changePassword({ currentPassword, newPassword });

      messageAPI.success(t("passwordChanged"));
      passwordForm.resetFields();
    } catch (error) {
      showError(error);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleProfileSubmit: NonNullable<
    FormProps<UpdateProfileParams>["onFinish"]
  > = (values) => {
    void submitProfile(values);
  };
  const handleUsernameSubmit: NonNullable<
    FormProps<UpdateUsernameParams>["onFinish"]
  > = (values) => {
    void submitUsername(values);
  };
  const handleEmailSubmit: NonNullable<
    FormProps<VerifyEmailParams>["onFinish"]
  > = (values) => {
    void submitEmail(values);
  };
  const handlePasswordSubmit: NonNullable<
    FormProps<PasswordFormParams>["onFinish"]
  > = (values) => {
    void submitPassword(values);
  };

  return (
    <Flex
      gap={token.marginMD}
      style={{
        paddingBlock: token.paddingMD,
        paddingInline: token.paddingSM,
      }}
      vertical
    >
      <Typography.Title level={1} style={{ fontSize: 20 }}>
        {t("account")}
      </Typography.Title>
      <Row gutter={[token.marginMD, token.marginMD]}>
        <Col xs={24} lg={12}>
          <Card title={t("basicInfo")} variant="borderless">
            <Form<UpdateProfileParams>
              form={profileForm}
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                personnelCode: user.personnelCode ?? undefined,
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
              <Form.Item label={t("personnelCode")} name="personnelCode">
                <Input />
              </Form.Item>
              <Form.Item htmlFor="account-mobile" label={t("mobile")}>
                <Input
                  disabled
                  id="account-mobile"
                  value={user.mobile}
                  style={{ direction: "ltr" }}
                />
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
        </Col>
        <Col xs={24} lg={12}>
          <Flex gap={token.marginMD} vertical>
            <Card title={t("username")} variant="borderless">
              <Form<UpdateUsernameParams>
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
              <Form<VerifyEmailParams>
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
                      onClick={() => void handleEmailVerificationRequest()}
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
          </Flex>
        </Col>
        <Col xs={24} lg={12}>
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
        </Col>
      </Row>
    </Flex>
  );
};
