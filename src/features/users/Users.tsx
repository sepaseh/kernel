import { ConfigProvider, FloatButton, Typography } from "antd";
import { useAntdToken } from "antd-style";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { UserForm } from "@/features/users/components/user-form/UserForm";
import { UserPasswordForm } from "@/features/users/components/user-password-form/UserPasswordForm";
import { UserRoleForm } from "@/features/users/components/user-role-form/UserRoleForm";
import { UsersFilters } from "@/features/users/components/users-filters/UsersFilters";
import { UsersTable } from "@/features/users/components/users-table/UsersTable";
import { useFilterParams } from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import {
  deleteUser,
  fetchUser,
  fetchUserRoleOptions,
  fetchUsers,
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
  const { messageAPI, modalAPI } = useAntd();
  const { user } = useCore();
  const { canCreate, canDelete, canUpdate } = getRoutePermissions(
    "users",
    user,
  );
  const { filters, setFilters } = useFilterParams<ListUsersQuery>();
  const { pathname, search } = useLocation();
  const token = useAntdToken();
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

  useEffect(
    () => () => debouncedHandleFilter.cancel(),
    [debouncedHandleFilter],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
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
        <UsersFilters
          filters={filters}
          onChange={(values) =>
            debouncedHandleFilter({ ...values, offset: undefined })
          }
        />
        <UsersTable
          canDelete={canDelete}
          canUpdate={canUpdate}
          current={current}
          data={data}
          isSystemAdmin={isSystemAdmin}
          loading={loading}
          offset={offset}
          onDelete={handleDelete}
          onEdit={(id) => void openUserDrawer(id, userDrawerKeys.update)}
          onManageRoles={(id) => void openUserDrawer(id, userDrawerKeys.roles)}
          onPageChange={(page) =>
            setFilters({
              ...filters,
              offset: String((page - 1) * defaultPageSize),
            })
          }
          onPassword={(id) => void openUserDrawer(id, userDrawerKeys.password)}
          onStatus={handleStatus}
          onSystemAdmin={handleSystemAdmin}
          pageSize={defaultPageSize}
          total={total}
        />
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
      <UserPasswordForm data={selectedData} />
    </>
  );
};
