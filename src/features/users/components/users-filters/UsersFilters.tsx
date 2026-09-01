import { Col, Form, Input, Row, Select } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { ListUsersQuery } from "@/features/users/types";
import { DigitsInput } from "@/shared/ui/digits-input";

type UsersFiltersProps = {
  filters: ListUsersQuery;
  onChange: (values: ListUsersQuery) => void;
};

export const UsersFilters = ({ filters, onChange }: UsersFiltersProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ListUsersQuery>();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filters, form]);

  return (
    <Form<ListUsersQuery>
      form={form}
      onValuesChange={(_, values) => onChange(values)}
    >
      <Row gutter={24}>
        <Col xs={24} sm={12} md={8} lg={6} xxl={4}>
          <Form.Item name="name">
            <Input allowClear placeholder={t("name")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xxl={4}>
          <Form.Item name="email">
            <Input
              allowClear
              placeholder={t("email")}
              style={{ direction: "ltr" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xxl={4}>
          <Form.Item name="mobile">
            <DigitsInput
              allowClear
              placeholder={t("mobile")}
              style={{ direction: "ltr" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xxl={4}>
          <Form.Item name="username">
            <Input
              allowClear
              placeholder={t("username")}
              style={{ direction: "ltr" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xxl={4}>
          <Form.Item name="status">
            <Select
              aria-label={t("status")}
              allowClear
              options={[
                { label: t("active"), value: "active" },
                { label: t("inactive"), value: "inactive" },
              ]}
              placeholder={t("status")}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
