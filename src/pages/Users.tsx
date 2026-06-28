import {
  Button,
  Col,
  ConfigProvider,
  FloatButton,
  Form,
  FormProps,
  Input,
  Row,
  Select,
  Table,
  TableProps,
  theme,
  Tooltip,
} from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fetchRoles,
  fetchUsers,
  updateUserPassword,
  updateUserStatus,
} from "@/api";
import { DateView } from "@/components/DateView";
import { DigitsInput } from "@/components/DigitsInput";
import { Icon } from "@/components/Icon";
import { defaultPageSize, modalKeys } from "@/config";
import { UserForm } from "@/forms/User";
import { UserFormRole } from "@/forms/UserRole";
import { useAntd, useCore, useFilterParams } from "@/hooks";
import { RoleProps, UserParams, UserProps } from "@/types";
import { tinyId } from "@/utils";

const { useToken } = theme;

type StateProps = {
  data: UserProps[];
  loading?: boolean;
  roles: RoleProps[];
  selectedData?: UserProps;
  total: number;
};

export const UsersPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({
    data: [],
    total: 0,
    roles: [],
  });
  const { data, loading, roles, selectedData, total } = state;
  const { messageAPI, modalAPI, notificationAPI } = useAntd();
  const { user } = useCore();
  const { filters, setFilters } = useFilterParams<UserParams>();
  const { pathname, search } = useLocation();
  const { token } = useToken();
  const [form] = Form.useForm<UserParams>();
  const navigate = useNavigate();
  const current = Number(filters.page ?? "1");
  const canCreate = user?.permissions.includes("user_create") ?? false;
  const canUpdate = user?.permissions.includes("user_update") ?? false;
  const canUpdateRoles = user?.permissions.includes("user_roles_update") ?? false;
  const canUpdateStatus =
    user?.permissions.includes("user_status_update") ?? false;

  const tableColumns: TableProps<UserProps>["columns"] = [
    {
      align: "center",
      dataIndex: "id",
      key: "index",
      render: (_, _record, index) =>
        (current - 1) * defaultPageSize + index + 1,
      title: t("row"),
      width: 60,
    },
    {
      dataIndex: "firstName",
      key: "firstName",
      title: t("firstName"),
    },
    {
      dataIndex: "lastName",
      key: "lastName",
      title: t("lastName"),
    },
    {
      align: "center",
      dataIndex: "personnelCode",
      key: "personnelCode",
      title: t("personnelCode"),
    },
    {
      align: "center",
      dataIndex: "username",
      key: "username",
      title: t("username"),
    },
    {
      align: "center",
      dataIndex: "roles",
      key: "roles",
      render: (_, { roles }) =>
        roles.length > 0 ? roles.map(({ name }) => name).join(", ") : "-",
      title: t("roles"),
    },
    {
      align: "center",
      dataIndex: "isActive",
      key: "status",
      render: (_, { id, isActive }) =>
        canUpdateStatus ? (
          <Button
            color={isActive ? "green" : "red"}
            onClick={() => handleStatus(id, isActive)}
            variant="link"
          >
            {t(isActive ? "active" : "inactive")}
          </Button>
        ) : (
          t(isActive ? "active" : "inactive")
        ),
      title: t("status"),
    },
    {
      align: "center",
      dataIndex: "createdAt",
      key: "date",
      render: (_, { createdAt }) => <DateView date={createdAt} />,
      title: t("date"),
    },
    {
      align: "center",
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <>
          {canUpdate && (
            <Tooltip title={t("update")}>
              <Button
                icon={<Icon name="edit" />}
                onClick={() => {
                  setState((prev) => ({ ...prev, selectedData: record }));

                  navigate(
                    { hash: modalKeys.update, pathname, search },
                    { state: true },
                  );
                }}
                type="text"
              />
            </Tooltip>
          )}
          {canUpdateRoles && (
            <Tooltip title={t("roles")}>
              <Button
                icon={<Icon name="key" />}
                onClick={() => {
                  setState((prev) => ({ ...prev, selectedData: record }));

                  navigate(
                    { hash: modalKeys.roles, pathname, search },
                    { state: true },
                  );
                }}
                type="text"
              />
            </Tooltip>
          )}
          <Tooltip title={t("password")}>
            <Button
              icon={<Icon name="lock" />}
              onClick={() => handlePassword(record.id)}
              type="text"
            />
          </Tooltip>
        </>
      ),
      title: t("action"),
      width: 120,
    },
  ];

  const debouncedHandleFilter = useMemo(
    () => debounce(setFilters, 500),
    [setFilters],
  );

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      form.setFieldsValue(filters);

      const { data, total } = await fetchUsers({
        ...filters,
        page: filters.page ?? "1",
        pageSize: String(defaultPageSize),
      });

      setState((prev) => ({ ...prev, data, loading: false, total }));
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);

      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [filters, form, messageAPI]);

  const handleFilter: FormProps["onValuesChange"] = (_, values) => {
    debouncedHandleFilter(values);
  };

  const handlePassword = (id: string) => {
    modalAPI.confirm({
      title: t("passwordConfirm"),
      okText: t("yes"),
      okType: "default",
      cancelText: t("no"),
      onOk: async () => {
        try {
          const password = tinyId();

          await updateUserPassword(id, password);

          navigator.clipboard.writeText(password);

          notificationAPI.success({
            title: t("password"),
            description: password,
          });
        } catch (error) {
          if (error instanceof Error) messageAPI.error(error.message);
          else console.error(error);
        }
      },
    });
  };

  const handleStatus = (id: string, isActive: boolean) => {
    modalAPI.confirm({
      title: t("statusConfirm"),
      okText: t("yes"),
      okType: "default",
      cancelText: t("no"),
      onOk: async () => {
        try {
          const { message } = await updateUserStatus(id, !isActive);

          messageAPI.success(message);

          fetchData();
        } catch (error) {
          if (error instanceof Error) messageAPI.error(error.message);
          else console.error(error);
        }
      },
    });
  };

  const handleTable: TableProps<UserProps>["onChange"] = ({ current }) => {
    debouncedHandleFilter({ page: current ? String(current) : undefined });
  };

  useEffect(() => {
    return () => debouncedHandleFilter.cancel();
  }, [debouncedHandleFilter]);

  useEffect(() => {
    void (() => {
      fetchData();
    })();
  }, [fetchData]);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await fetchRoles({
          page: "1",
          pageSize: String(defaultPageSize * 10),
        });

        setState((prev) => ({ ...prev, roles: data }));
      } catch (error) {
        if (error instanceof Error) messageAPI.error(error.message);
        else console.error(error);
      }
    })();
  }, [messageAPI]);

  return (
    <>
      <div
        style={{
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
          flexGrow: 1,
        }}
      >
        <Form<UserParams> form={form} onValuesChange={handleFilter}>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="firstName">
                <Input placeholder={t("firstName")} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="lastName">
                <Input placeholder={t("lastName")} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="username">
                <Input placeholder={t("username")} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="personnelCode">
                <DigitsInput placeholder={t("personnelCode")} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="isActive">
                <Select
                  options={[
                    { label: t("active"), value: "1" },
                    { label: t("inactive"), value: "0" },
                  ]}
                  placeholder={t("status")}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserParams> name="roleId">
                <Select
                  options={roles.map(({ id, name }) => ({
                    label: name,
                    value: id,
                  }))}
                  placeholder={t("role")}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table<UserProps>
          columns={tableColumns}
          dataSource={data}
          loading={loading}
          onChange={handleTable}
          pagination={{
            current,
            pageSize: defaultPageSize,
            showSizeChanger: false,
            total,
          }}
          rowKey="id"
          scroll={{ x: token.screenXL }}
          size="small"
        />
      </div>
      {canCreate && (
        <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
          <FloatButton
            icon={<Icon name="add" />}
            onClick={() =>
              navigate(
                { hash: modalKeys.create, pathname, search },
                { state: true },
              )
            }
            tooltip={t("create")}
            type="primary"
          />
        </ConfigProvider>
      )}
      <UserForm data={selectedData} onFinish={fetchData} />
      <UserFormRole
        data={selectedData}
        onFinish={fetchData}
        options={{ roles }}
      />
    </>
  );
};
