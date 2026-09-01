import type { TableProps } from "antd";
import {
  Button,
  ConfigProvider,
  Flex,
  FloatButton,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useAntdToken } from "antd-style";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
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

  const handleUpdate = async (id: string) => {
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

  const handleDelete = (id: string) => {
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
      render: (values: string[]) => values.length,
      title: t("permissions"),
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
                onClick={() => void handleUpdate(record.id)}
                type="text"
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={t("delete")}>
              <Button
                aria-label={t("delete")}
                danger
                icon={<Icon name="delete" size={14} />}
                onClick={() => handleDelete(record.id)}
                type="text"
              />
            </Tooltip>
          )}
        </Flex>
      ),
      title: t("action"),
      width: 100,
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
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

  useEffect(() => {
    const scrollRegion =
      tableContainerRef.current?.querySelector<HTMLElement>(
        ".ant-table-content",
      );

    if (scrollRegion) {
      scrollRegion.tabIndex = 0;
      scrollRegion.setAttribute("role", "region");
      scrollRegion.setAttribute("aria-label", t("roles"));
    }
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
        ref={tableContainerRef}
      >
        <Typography.Title level={1} style={{ fontSize: 20 }}>
          {t("roles")}
        </Typography.Title>
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
        <ConfigProvider theme={{ token: { colorPrimary: token.colorSuccess } }}>
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
        </ConfigProvider>
      )}
      <RoleForm
        data={selectedData}
        onFinish={fetchData}
        options={{ permissions }}
      />
    </>
  );
};
