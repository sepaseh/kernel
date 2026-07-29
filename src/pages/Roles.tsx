/* eslint-disable react-hooks/set-state-in-effect */
import {
  Button,
  ConfigProvider,
  Flex,
  FloatButton,
  Table,
  TableProps,
  Tooltip,
} from "antd";
import { useAntdToken } from "antd-style";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { deleteRole, fetchPermissions, fetchRole, fetchRoles } from "@/api";
import { Icon } from "@/components/Icon";
import { modalKeys } from "@/config";
import { RoleForm } from "@/forms/Role";
import { useActionPermissions, useAntd } from "@/hooks";
import { PermissionGroupProps, RoleProps } from "@/types";

export const RolesPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<RoleProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionGroupProps[]>([]);
  const [selectedData, setSelectedData] = useState<RoleProps>();
  const { messageAPI, modalAPI } = useAntd();
  const { canCreateRoles, canDeleteRoles, canUpdateRoles } =
    useActionPermissions();
  const { pathname, search } = useLocation();
  const token = useAntdToken();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setData(await fetchRoles());
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
    } finally {
      setLoading(false);
    }
  }, [messageAPI]);

  const handleUpdate = async (id: string) => {
    try {
      setLoading(true);
      setSelectedData(await fetchRole(id));
      navigate({ hash: modalKeys.update, pathname, search }, { state: true });
    } catch (error) {
      if (error instanceof Error) messageAPI.error(error.message);
      else console.error(error);
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
          if (error instanceof Error) messageAPI.error(error.message);
          else console.error(error);
        }
      },
      title: t("deleteRoleConfirm"),
    });
  };

  const tableColumns: TableProps<RoleProps>["columns"] = [
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
          {canUpdateRoles && (
            <Tooltip title={t("update")}>
              <Button
                icon={<Icon name="edit" />}
                onClick={() => void handleUpdate(record.id)}
                type="text"
              />
            </Tooltip>
          )}
          {canDeleteRoles && (
            <Tooltip title={t("delete")}>
              <Button
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
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!canCreateRoles && !canUpdateRoles) return;

    void (async () => {
      try {
        setPermissions(await fetchPermissions());
      } catch (error) {
        if (error instanceof Error) messageAPI.error(error.message);
        else console.error(error);
      }
    })();
  }, [canCreateRoles, canUpdateRoles, messageAPI]);

  return (
    <>
      <div
        style={{
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingSM,
          flexGrow: 1,
        }}
      >
        <Table<RoleProps>
          columns={tableColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="id"
          scroll={{ x: token.screenMD }}
          size="small"
        />
      </div>
      {canCreateRoles && (
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
      <RoleForm
        data={selectedData}
        onFinish={fetchData}
        options={{ permissions }}
      />
    </>
  );
};
