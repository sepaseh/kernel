import type { TableProps } from "antd";
import { Button, Flex, FloatButton, Table, Tooltip } from "antd";
import { useAntdToken } from "antd-style";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { RoleForm } from "@/features/roles/components/role-form/RoleForm";
import { getErrorMessage } from "@/shared/lib";
import { Icon } from "@/shared/ui/icon";

import { deleteRole, fetchPermissions, fetchRole, fetchRoles } from "./api";
import { roleDrawerKeys } from "./constants";
import type { PermissionGroup, Role } from "./types";

export const RolesPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [selectedData, setSelectedData] = useState<Role>();
  const { messageAPI, modalAPI } = useAntd();
  const { user } = useCore();
  const { canCreate, canDelete, canUpdate } = getRoutePermissions(
    "roles",
    user,
  );
  const { pathname, search } = useLocation();
  const token = useAntdToken();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setData(await fetchRoles());
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [messageAPI]);

  const handleUpdate = async (id: Role["id"]) => {
    try {
      setLoading(true);
      setSelectedData(await fetchRole(id));
      navigate(
        { hash: roleDrawerKeys.update, pathname, search },
        { state: true },
      );
    } catch (error) {
      messageAPI.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: Role["id"]) => {
    modalAPI.confirm({
      cancelText: t("no"),
      okButtonProps: { danger: true },
      okText: t("yes"),
      onOk: async () => {
        try {
          await deleteRole(id);
          messageAPI.success(t("roleDeleted"));
          await fetchData();
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        }
      },
      title: t("deleteRoleConfirm"),
    });
  };

  const tableColumns: TableProps<Role>["columns"] = [
    {
      align: "center",
      key: "index",
      render: (_, _record, index) => index + 1,
      title: t("row"),
      width: 60,
    },
    {
      dataIndex: "name",
      title: t("name"),
    },
    {
      align: "center",
      dataIndex: "permissions",
      render: (_, { permissions }) => permissions.length,
      title: t("permissions"),
      width: 120,
    },
    {
      align: "center",
      key: "actions",
      render: (_, record) => (
        <Flex justify="center">
          {canUpdate && (
            <Tooltip title={t("update")}>
              <Button
                aria-label={t("update")}
                icon={<Icon name="edit" />}
                onClick={() => handleUpdate(record.id)}
                type="text"
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={t("delete")}>
              <Button
                aria-label={t("delete")}
                icon={<Icon name="delete" size={14} />}
                onClick={() => handleDelete(record.id)}
                type="text"
              />
            </Tooltip>
          )}
        </Flex>
      ),
      title: t("action"),
      width: 80,
    },
  ];

  useEffect(() => {
    void (() => {
      fetchData();
    })();
  }, [fetchData]);

  useEffect(() => {
    if (!canCreate && !canUpdate) return;

    void (async () => {
      try {
        setPermissions(await fetchPermissions());
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      }
    })();
  }, [canCreate, canUpdate, messageAPI]);

  return (
    <>
      <div
        style={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Table<Role>
          columns={tableColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="id"
          scroll={{ x: token.screenMD }}
          size="small"
        />
      </div>
      {canCreate && (
        <FloatButton
          aria-label={t("create")}
          icon={<Icon name="add" />}
          onClick={() =>
            navigate(
              { hash: roleDrawerKeys.create, pathname, search },
              { state: true },
            )
          }
          tooltip={t("create")}
          type="primary"
        />
      )}
      <RoleForm
        data={selectedData}
        onFinish={fetchData}
        options={{ permissions }}
      />
    </>
  );
};
