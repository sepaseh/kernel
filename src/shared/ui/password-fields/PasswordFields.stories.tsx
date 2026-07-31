import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Form } from "antd";

import { PasswordFields } from "./PasswordFields";

const PasswordFieldsStory = ({ size }: { size?: "large" }) => (
  <Form layout="vertical" style={{ width: 320 }}>
    <PasswordFields size={size} />
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
