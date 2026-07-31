import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Form } from "antd";
import type { ComponentProps } from "react";

import { PasswordFields } from "./PasswordFields";

const PasswordFieldsStory = ({
  passwordLabel,
  size,
}: ComponentProps<typeof PasswordFields>) => (
  <Form layout="vertical" style={{ width: 320 }}>
    <PasswordFields passwordLabel={passwordLabel} size={size} />
    <Button htmlType="submit" type="primary">
      Validate
    </Button>
  </Form>
);

const meta = {
  component: PasswordFields,
  parameters: { layout: "centered" },
  render: (args) => <PasswordFieldsStory {...args} />,
  title: "Shared UI/PasswordFields",
} satisfies Meta<typeof PasswordFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: "large" } };
export const NewPassword: Story = { args: { passwordLabel: "newPass" } };
