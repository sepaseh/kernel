import type { TableProps } from "antd";
import {
  Button,
  Col,
  ConfigProvider,
  FloatButton,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useAntdToken } from "antd-style";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { UserForm } from "@/features/users/components/user-form/UserForm";
import { UserRoleForm } from "@/features/users/components/user-role-form/UserRoleForm";
import { useFilterParams } from "@/shared/hooks";
import { getErrorMessage, tinyId } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { Icon } from "@/shared/ui/icon";

import {
  deleteUser,
  fetchUser,
  fetchUserRoleOptions,
  fetchUsers,
  updateUserPassword,
  updateUserStatus,
  updateUserSystemAdmin,
} from "./api";
import { defaultPageSize, userDrawerKeys } from "./constants";
import type { ListUsersQuery, User, UserOption, UserSummary } from "./types";

export const UsersPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<UserOption[]>([]);
  const [selectedData, setSelectedData] = useState<User>();
  const [total, setTotal] = useState(0);
  const [filterForm] = Form.useForm<ListUsersQuery>();
  const { messageAPI, modalAPI, notificationAPI } = useAntd();
  const { user } = useCore();
  const { canCreate, canDelete, canUpdate } = getRoutePermissions(
    "users",
    user,
  );
  const { filters, setFilters } = useFilterParams<ListUsersQuery>();
  const { pathname, search } = useLocation();
  const token = useAntdToken();
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const offset = Number(filters.offset ?? "0");
  const current = Math.floor(offset / defaultPageSize) + 1;
  const isSystemAdmin = user?.isSystemAdmin ?? false;
  const hasActions = canDelete || canUpdate || isSystemAdmin;

  const debouncedHandleFilter = useMemo(
    () => debounce(setFilters, 500),
    [setFilters],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [filters, messageAPI, offset]);

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

  const handleStatus = (record: UserSummary) => {
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

  const handlePassword = (id: string) => {
    if (!canUpdate) return;

    modalAPI.confirm({
      cancelText: t("no"),
      okText: t("yes"),
      okType: "default",
      onOk: async () => {
        try {
          const password = tinyId();
          await updateUserPassword(id, { password });
          void navigator.clipboard?.writeText(password).catch(() => undefined);
          notificationAPI.success({
            description: password,
            message: t("password"),
          });
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("passwordConfirm"),
    });
  };

  const handleSystemAdmin = (record: UserSummary) => {
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

  const tableColumns: TableProps<UserSummary>["columns"] = [
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
    { align: "center", dataIndex: "mobile", title: t("mobile") },
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
        canUpdate ? (
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
    ...(hasActions
      ? [
          {
            align: "center" as const,
            key: "actions",
            render: (_: unknown, record: UserSummary) => (
              <>
                {canUpdate && (
                  <>
                    <Tooltip title={t("update")}>
                      <Button
                        aria-label={t("update")}
                        icon={<Icon name="edit" />}
                        onClick={() =>
                          void openUserDrawer(record.id, userDrawerKeys.update)
                        }
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title={t("roles")}>
                      <Button
                        aria-label={t("roles")}
                        icon={<Icon name="key" />}
                        onClick={() =>
                          void openUserDrawer(record.id, userDrawerKeys.roles)
                        }
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title={t("password")}>
                      <Button
                        aria-label={t("password")}
                        icon={<Icon name="lock" />}
                        onClick={() => handlePassword(record.id)}
                        type="text"
                      />
                    </Tooltip>
                  </>
                )}
                {isSystemAdmin && (
                  <Tooltip title={t("systemAdmin")}>
                    <Button
                      aria-label={t("systemAdmin")}
                      icon={<Icon name="bolt" />}
                      onClick={() => handleSystemAdmin(record)}
                      type="text"
                    />
                  </Tooltip>
                )}
                {canDelete && (
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
        ]
      : []),
  ];

  useEffect(
    () => () => debouncedHandleFilter.cancel(),
    [debouncedHandleFilter],
  );

  useEffect(() => {
    filterForm.resetFields();
    filterForm.setFieldsValue(filters);
  }, [filterForm, filters]);

  useEffect(() => {
    void (() => {
      fetchData();
    })();
  }, [fetchData]);

  useEffect(() => {
    if (!canUpdate) return;

    void (async () => {
      try {
        setRoles(await fetchUserRoleOptions());
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      }
    })();
  }, [canUpdate, messageAPI]);

  useEffect(() => {
    const scrollRegion =
      tableContainerRef.current?.querySelector<HTMLElement>(
        ".ant-table-content",
      );
    if (!scrollRegion) return;

    scrollRegion.tabIndex = 0;
    scrollRegion.setAttribute("role", "region");
    scrollRegion.setAttribute("aria-label", t("users"));
  }, [data, t]);

  return (
    <>
      <div
        style={{
          flexGrow: 1,
          minWidth: 0,
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
        }}
      >
        <Typography.Title level={1} style={{ fontSize: 20 }}>
          {t("users")}
        </Typography.Title>
        <Form<ListUsersQuery>
          form={filterForm}
          onValuesChange={(_, values) =>
            debouncedHandleFilter({ ...values, offset: undefined })
          }
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
        <div ref={tableContainerRef}>
          <Table<UserSummary>
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
      </div>
      {canCreate && (
        <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
          <FloatButton
            aria-label={t("create")}
            icon={<Icon name="add" />}
            onClick={() =>
              navigate(
                { hash: userDrawerKeys.create, pathname, search },
                { state: true },
              )
            }
            tooltip={t("create")}
            type="primary"
          />
        </ConfigProvider>
      )}
      <UserForm data={selectedData} onFinish={fetchData} />
      <UserRoleForm
        data={selectedData}
        onFinish={fetchData}
        options={{ roles }}
      />
    </>
  );
};
