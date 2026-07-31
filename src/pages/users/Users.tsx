/* eslint-disable react-hooks/set-state-in-effect */
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
  Tooltip,
  Typography,
} from "antd";
import { useAntdToken } from "antd-style";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import {
  deleteUser,
  fetchUser,
  fetchUserRoleOptions,
  fetchUsers,
  fetchUserWorkspaceOptions,
  updateUserStatus,
  updateUserSystemAdmin,
} from "@/api";
import { DigitsInput } from "@/components/digits-input";
import { Icon } from "@/components/icon";
import { defaultPageSize, modalKeys } from "@/config";
import { UserForm } from "@/forms/user";
import { UserPasswordForm } from "@/forms/user-password";
import { UserFormRole } from "@/forms/user-role";
import { UserWorkspaceForm } from "@/forms/user-workspace";
import {
  useActionPermissions,
  useAntd,
  useCore,
  useFilterParams,
} from "@/hooks";
import {
  UserListParams,
  UserOptionProps,
  UserProps,
  UserSummaryProps,
} from "@/types";
import { getErrorMessage } from "@/utils";

export const UsersPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<UserSummaryProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<UserOptionProps[]>([]);
  const [selectedData, setSelectedData] = useState<UserProps>();
  const [total, setTotal] = useState(0);
  const [workspaces, setWorkspaces] = useState<UserOptionProps[]>([]);
  const { messageAPI, modalAPI } = useAntd();
  const { canCreateUsers, canDeleteUsers, canUpdateUsers } =
    useActionPermissions();
  const { user } = useCore();
  const { filters, setFilters } = useFilterParams<UserListParams>();
  const { pathname, search } = useLocation();
  const token = useAntdToken();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm<UserListParams>();
  const navigate = useNavigate();
  const offset = Number(filters.offset ?? "0");
  const current = Math.floor(offset / defaultPageSize) + 1;
  const isSystemAdmin = user?.isSystemAdmin ?? false;

  const debouncedHandleFilter = useMemo(
    () => debounce(setFilters, 500),
    [setFilters],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      form.setFieldsValue(filters);
      const response = await fetchUsers({
        ...filters,
        offset: String(offset),
        size: String(defaultPageSize),
      });
      setData(response.items);
      setTotal(response.total);
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters, form, messageAPI, offset]);

  const openUserDrawer = async (id: string, hash: string) => {
    try {
      setLoading(true);
      const details = await fetchUser(id);
      setSelectedData(details);
      navigate({ hash, pathname, search }, { state: true });
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = (record: UserSummaryProps) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okText: t("yes"),
      onOk: async () => {
        try {
          await updateUserStatus(record.id, {
            status: record.status === "active" ? "inactive" : "active",
          });
          messageAPI.success(t("statusUpdated"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("statusConfirm"),
    });
  };

  const handleSystemAdmin = (record: UserSummaryProps) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okText: t("yes"),
      onOk: async () => {
        try {
          await updateUserSystemAdmin(record.id, {
            isSystemAdmin: !record.isSystemAdmin,
          });
          messageAPI.success(t("systemAdminUpdated"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("systemAdminConfirm"),
    });
  };

  const handleDelete = (id: string) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okButtonProps: { danger: true },
      okText: t("yes"),
      onOk: async () => {
        try {
          await deleteUser(id);
          messageAPI.success(t("userDeleted"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("deleteUserConfirm"),
    });
  };

  const tableColumns: TableProps<UserSummaryProps>["columns"] = [
    {
      align: "center",
      key: "index",
      render: (_, _record, index) => offset + index + 1,
      title: t("row"),
      width: 60,
    },
    {
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      title: t("name"),
    },
    {
      align: "center",
      dataIndex: "mobile",
      title: t("mobile"),
    },
    {
      align: "center",
      dataIndex: "email",
      render: (value: string | null) => value ?? "-",
      title: t("email"),
    },
    {
      align: "center",
      dataIndex: "username",
      render: (value: string | null) => value ?? "-",
      title: t("username"),
    },
    {
      align: "center",
      dataIndex: "personnelCode",
      title: t("personnelCode"),
    },
    {
      align: "center",
      dataIndex: "isSystemAdmin",
      render: (value: boolean) => t(value ? "yes" : "no"),
      title: t("systemAdmin"),
    },
    {
      align: "center",
      dataIndex: "status",
      render: (_, record) =>
        canUpdateUsers ? (
          <Button
            color={record.status === "active" ? "green" : "red"}
            onClick={() => handleStatus(record)}
            variant="link"
          >
            {t(record.status)}
          </Button>
        ) : (
          t(record.status)
        ),
      title: t("status"),
    },
    {
      align: "center",
      key: "actions",
      render: (_, record) => (
        <>
          {canUpdateUsers && (
            <>
              <Tooltip title={t("update")}>
                <Button
                  aria-label={t("update")}
                  icon={<Icon name="edit" />}
                  onClick={() =>
                    void openUserDrawer(record.id, modalKeys.update)
                  }
                  type="text"
                />
              </Tooltip>
              <Tooltip title={t("roles")}>
                <Button
                  aria-label={t("roles")}
                  icon={<Icon name="key" />}
                  onClick={() =>
                    void openUserDrawer(record.id, modalKeys.roles)
                  }
                  type="text"
                />
              </Tooltip>
              <Tooltip title={t("workspaces")}>
                <Button
                  aria-label={t("workspaces")}
                  icon={<Icon name="home" />}
                  onClick={() =>
                    void openUserDrawer(record.id, modalKeys.workspaces)
                  }
                  type="text"
                />
              </Tooltip>
            </>
          )}
          {isSystemAdmin && (
            <>
              <Tooltip title={t("password")}>
                <Button
                  aria-label={t("password")}
                  icon={<Icon name="lock" />}
                  onClick={() =>
                    void openUserDrawer(record.id, modalKeys.password)
                  }
                  type="text"
                />
              </Tooltip>
              <Tooltip title={t("systemAdmin")}>
                <Button
                  aria-label={t("systemAdmin")}
                  icon={<Icon name="bolt" />}
                  onClick={() => handleSystemAdmin(record)}
                  type="text"
                />
              </Tooltip>
            </>
          )}
          {canDeleteUsers && (
            <Tooltip title={t("delete")}>
              <Button
                aria-label={t("delete")}
                danger
                icon={<Icon name="delete" />}
                onClick={() => handleDelete(record.id)}
                type="text"
              />
            </Tooltip>
          )}
        </>
      ),
      title: t("action"),
      width: 220,
    },
  ];

  const handleFilter: FormProps<UserListParams>["onValuesChange"] = (
    _,
    values,
  ) => {
    debouncedHandleFilter({ ...values, offset: undefined });
  };

  useEffect(() => {
    return () => debouncedHandleFilter.cancel();
  }, [debouncedHandleFilter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!canUpdateUsers) return;

    void (async () => {
      try {
        const [roleOptions, workspaceOptions] = await Promise.all([
          fetchUserRoleOptions(),
          fetchUserWorkspaceOptions(),
        ]);
        setRoles(roleOptions);
        setWorkspaces(workspaceOptions);
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      }
    })();
  }, [canUpdateUsers, messageAPI]);

  useEffect(() => {
    const scrollRegion =
      tableContainerRef.current?.querySelector<HTMLElement>(
        ".ant-table-content",
      );

    if (scrollRegion) scrollRegion.tabIndex = 0;
  }, [data]);

  return (
    <>
      <div
        style={{
          minWidth: 0,
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
          flexGrow: 1,
        }}
        ref={tableContainerRef}
      >
        <Typography.Title level={1} style={{ fontSize: 20 }}>
          {t("users")}
        </Typography.Title>
        <Form<UserListParams> form={form} onValuesChange={handleFilter}>
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
        <Table<UserSummaryProps>
          columns={tableColumns}
          dataSource={data}
          loading={loading}
          onChange={({ current: page }) =>
            setFilters({
              ...filters,
              offset: String(((page ?? 1) - 1) * defaultPageSize),
            })
          }
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
      {canCreateUsers && (
        <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
          <FloatButton
            aria-label={t("create")}
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
      <UserWorkspaceForm
        data={selectedData}
        onFinish={fetchData}
        options={{ workspaces }}
      />
      <UserPasswordForm data={selectedData} />
    </>
  );
};
