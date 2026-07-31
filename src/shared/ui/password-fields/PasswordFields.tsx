import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";

type PasswordFieldsProps = {
  passwordLabel?: "newPass" | "password";
  size?: "large";
};

export const PasswordFields = ({
  passwordLabel = "password",
  size,
}: PasswordFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Form.Item
        label={t(passwordLabel)}
        name="password"
        rules={[{ required: true }]}
      >
        <Input.Password
          placeholder={size ? t(passwordLabel) : undefined}
          size={size}
          styles={{ input: { direction: "ltr" } }}
        />
      </Form.Item>
      <Form.Item
        dependencies={["password"]}
        label={t("confirmPass")}
        name="confirmPassword"
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              return !value || getFieldValue("password") === value
                ? Promise.resolve()
                : Promise.reject(new Error(t("passsMismatch")));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={size ? t("confirmPass") : undefined}
          size={size}
          styles={{ input: { direction: "ltr" } }}
        />
      </Form.Item>
    </>
  );
};
