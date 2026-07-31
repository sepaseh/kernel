import type { Meta, StoryObj } from "@storybook/react-vite";
import { Form, Input } from "antd";
import { fn } from "storybook/test";

import { FormDrawer } from "./FormDrawer";

const content = (
  <Form layout="vertical">
    <Form.Item label="Name" name="name">
      <Input placeholder="Enter a name" />
    </Form.Item>
  </Form>
);

const meta = {
  args: {
    children: content,
    onClose: fn(),
    onSubmit: fn(),
    open: true,
    submitting: false,
    title: "Example form",
  },
  component: FormDrawer,
  parameters: { layout: "fullscreen" },
  title: "Shared UI/FormDrawer",
} satisfies Meta<typeof FormDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: { submitting: true },
};
