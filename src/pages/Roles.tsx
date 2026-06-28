import {
  Button,
  ConfigProvider,
  Flex,
  FloatButton,
  Table,
  TableProps,
  theme,
  Tooltip,
} from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { deleteRole, fetchPermissions, fetchRoles } from "@/api";
import { Icon } from "@/components/Icon";
import { defaultPageSize, modalKeys } from "@/config";
import { RoleForm } from "@/forms/Role";
import { useAntd, useCore, useFilterParams } from "@/hooks";
import { PermissionProps, RoleParams, RoleProps } from "@/types";

const { useToken } = theme;

type StateProps = {
  data: RoleProps[];
  loading?: boolean;
  permissions: PermissionProps[];
  selectedData?: RoleProps;
  total: number;
};

export const RolesPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({
    data: [],
    permissions: [],
    total: 0,
  });
  const { data, loading, permissions, selectedData, total } = state;
  const { messageAPI, modalAPI } = useAntd();
  const { user } = useCore();
  const { filters, setFilters } = useFilterParams<RoleParams>();
  const { pathname, search } = useLocation();
  const { token } = useToken();
  const navigate = useNavigate();
  const current = Number(filters.page ?? "1");
  const canCreate = user?.permissions.includes("role_create") ?? false;
  const canDelete = user?.permissions.includes("role_delete") ?? false;
  const canUpdate = user?.permissions.includes("role_update") ?? false;

  const tableColumns: TableProps<RoleProps>["columns"] = [
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
      dataIndex: "name",
      key: "name",
      title: t("name"),
    },
    {
      align: "center",
      dataIndex: "description",
      key: "description",
      title: t("description"),
    },
    {
      align: "center",
      dataIndex: "permissions",
      key: "permissions",
      render: (_, { permissions }) => permissions.length,
      title: t("permissions"),
    },
    {
      align: "center",
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <Flex>
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
          {canDelete && (
            <Tooltip title={t("delete")}>
              <Button
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

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, total } = await fetchRoles({
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
  }, [filters, messageAPI]);

  const handleDelete = (id: string) => {
    modalAPI.confirm({
      title: t("deleteConfirm"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
      onOk: async () => {
        try {
          await deleteRole(id);

          fetchData();
        } catch (error) {
          if (error instanceof Error) messageAPI.error(error.message);
          else console.error(error);
        }
      },
    });
  };

  const debouncedHandleFilter = useMemo(
    () => debounce(setFilters, 500),
    [setFilters],
  );

  const handleTable: TableProps<RoleProps>["onChange"] = ({ current }) => {
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
        const permissions = await fetchPermissions();

        setState((prev) => ({ ...prev, permissions }));
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
        <Table<RoleProps>
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
          scroll={{ x: token.screenMD }}
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
      <RoleForm
        data={selectedData}
        onFinish={fetchData}
        options={{ permissions }}
      />
    </>
  );
};
