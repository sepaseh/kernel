import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  FormProps,
  Input,
  Row,
  theme,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { changePassword } from "@/api";
import { useAntd } from "@/hooks";
import { PasswordParams } from "@/types";

const { useToken } = theme;

export const PasswordPage = () => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI } = useAntd();
  const { token } = useToken();
  const [form] = Form.useForm<PasswordParams>();

  const handleSubmit: FormProps<PasswordParams>["onFinish"] = async ({
    newPassword,
    oldPassword,
  }) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const { message } = await changePassword({ newPassword, oldPassword });

      messageAPI.success(message);
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        style={{
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
          flexGrow: 1,
        }}
      >
        <Row>
          <Col xs={24} sm={16} md={12} lg={10} xxl={8} xxxl={6}>
            <Card size="small" variant="borderless">
              <Form<PasswordParams>
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item<PasswordParams>
                  label={t("currentPass")}
                  name="oldPassword"
                  rules={[{ required: true }]}
                >
                  <Input.Password styles={{ input: { direction: "ltr" } }} />
                </Form.Item>
                <Form.Item<PasswordParams>
                  label={t("newPass")}
                  name="newPassword"
                  rules={[{ required: true }]}
                >
                  <Input.Password styles={{ input: { direction: "ltr" } }} />
                </Form.Item>
                <Form.Item<PasswordParams>
                  label={t("confirmPass")}
                  name="confirmPassword"
                  dependencies={["newPassword"]}
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
                    loading={submitting}
                    onClick={() => form.submit()}
                    type="primary"
                  >
                    {t("submit")}
                  </Button>
                </Flex>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};
