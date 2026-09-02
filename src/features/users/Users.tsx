import type { TableProps } from "antd";
import {
  Button,
  Col,
  FloatButton,
  Form,
  Input,
  Row,
  Select,
  Table,
  Tooltip,
} from "antd";
import { useAntdToken } from "antd-style";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { fetchRoles, type Role } from "@/features/roles";
import { UserForm } from "@/features/users/components/user-form/UserForm";
import { UserRoleForm } from "@/features/users/components/user-role-form/UserRoleForm";
import { useFilterParams } from "@/shared/hooks";
import { getErrorMessage, tinyId } from "@/shared/lib";
import { DigitsInput } from "@/shared/ui/digits-input";
import { Icon } from "@/shared/ui/icon";

import {
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUserPassword,
  updateUserStatus,
  updateUserSystemAdmin,
} from "./api";
import { defaultPageSize, userDrawerKeys } from "./constants";
import type {
  User,
  UserListQuery,
  UserStatusRequest,
  UserSystemAdminRequest,
} from "./types";

export const UsersPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedData, setSelectedData] = useState<User>();
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm<UserListQuery>();
  const { messageAPI, modalAPI, notificationAPI } = useAntd();
  const { user } = useCore();
  const { canCreate, canDelete, canUpdate } = getRoutePermissions(
    "users",
    user,
  );
  const { filters, setFilters } = useFilterParams<UserListQuery>();
  const { pathname, search } = useLocation();
  const token = useAntdToken();
  const navigate = useNavigate();
  const offset = Number(filters.offset ?? "0");
  const current = Math.floor(offset / defaultPageSize) + 1;
  const isSystemAdmin = user?.isSystemAdmin ?? false;
  const hasActions = canDelete || canUpdate;

  const debouncedHandleFilter = useMemo(
    () => debounce(setFilters, 500),
    [setFilters],
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      form.resetFields();
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

  const openUserDrawer = async (
    id: User["id"],
    hash: typeof userDrawerKeys.roles | typeof userDrawerKeys.update,
  ) => {
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

  const handleStatus = (id: User["id"], params: UserStatusRequest) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okText: t("yes"),
      onOk: async () => {
        try {
          await updateUserStatus(id, params);
          messageAPI.success(t("statusUpdated"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("statusConfirm"),
    });
  };

  const handlePassword = (id: User["id"]) => {
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

  const handleSystemAdmin = (
    id: User["id"],
    params: UserSystemAdminRequest,
  ) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okText: t("yes"),
      onOk: async () => {
        try {
          await updateUserSystemAdmin(id, params);
          messageAPI.success(t("systemAdminUpdated"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("systemAdminConfirm"),
    });
  };

  const handleDelete = (id: User["id"]) => {
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

  const tableColumns: TableProps<User>["columns"] = [
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
      render: (_, { email }) => email || "-",
      title: t("email"),
    },
    {
      align: "center",
      dataIndex: "username",
      render: (_, { username }) => username || "-",
      title: t("username"),
    },
    ...(isSystemAdmin
      ? ([
          {
            align: "center",
            dataIndex: "isSystemAdmin",
            render: (_, { id, isSystemAdmin }) => {
              const label = t(isSystemAdmin ? "yes" : "no");

              return (
                <Tooltip title={label}>
                  <Button
                    aria-label={label}
                    color={isSystemAdmin ? "green" : "red"}
                    icon={<Icon name={isSystemAdmin ? "check" : "close"} />}
                    onClick={() =>
                      handleSystemAdmin(id, { isSystemAdmin: !isSystemAdmin })
                    }
                    variant="link"
                  />
                </Tooltip>
              );
            },
            title: t("systemAdmin"),
            width: 120,
          },
        ] satisfies TableProps<User>["columns"])
      : []),
    {
      align: "center",
      dataIndex: "status",
      render: (_, { id, status }) => {
        const active = status === "active";
        const label = t(status);

        return (
          <Tooltip title={label}>
            {canUpdate ? (
              <Button
                aria-label={label}
                color={active ? "green" : "red"}
                icon={<Icon name={active ? "check" : "close"} />}
                onClick={() =>
                  handleStatus(id, {
                    status: active ? "inactive" : "active",
                  })
                }
                variant="link"
              />
            ) : (
              <span
                aria-label={label}
                role="img"
                style={{
                  color: active ? token.colorSuccess : token.colorError,
                }}
              >
                <Icon name={active ? "check" : "close"} />
              </span>
            )}
          </Tooltip>
        );
      },
      title: t("status"),
      width: 120,
    },
    ...(hasActions
      ? [
          {
            align: "center" as const,
            key: "actions",
            render: (_: unknown, record: User) => (
              <>
                {canUpdate && (
                  <>
                    <Tooltip title={t("update")}>
                      <Button
                        aria-label={t("update")}
                        icon={<Icon name="edit" />}
                        onClick={() =>
                          openUserDrawer(record.id, userDrawerKeys.update)
                        }
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title={t("roles")}>
                      <Button
                        aria-label={t("roles")}
                        icon={<Icon name="key" />}
                        onClick={() =>
                          openUserDrawer(record.id, userDrawerKeys.roles)
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
                {canDelete && (
                  <Tooltip title={t("delete")}>
                    <Button
                      aria-label={t("delete")}
                      icon={<Icon name="delete" />}
                      onClick={() => handleDelete(record.id)}
                      type="text"
                    />
                  </Tooltip>
                )}
              </>
            ),
            title: t("action"),
            width: 160,
          },
        ]
      : []),
  ];

  useEffect(
    () => () => debouncedHandleFilter.cancel(),
    [debouncedHandleFilter],
  );

  useEffect(() => {
    void (() => {
      fetchData();
    })();
  }, [fetchData]);

  useEffect(() => {
    if (!canUpdate) return;

    void (async () => {
      try {
        setRoles(await fetchRoles());
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      }
    })();
  }, [canUpdate, messageAPI]);

  return (
    <>
      <div
        style={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Form<UserListQuery>
          form={form}
          onValuesChange={(_, values) =>
            debouncedHandleFilter({ ...values, offset: undefined })
          }
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="firstName">
                <Input allowClear placeholder={t("firstName")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="lastName">
                <Input allowClear placeholder={t("lastName")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="email">
                <Input allowClear placeholder={t("email")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="mobile">
                <DigitsInput allowClear placeholder={t("mobile")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="username">
                <Input allowClear placeholder={t("username")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xxl={4} xxxl={3}>
              <Form.Item<UserListQuery> name="status">
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
        <Table<User>
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
      {canCreate && (
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
