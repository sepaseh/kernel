import type { TableProps } from "antd";
import { Button, Table, Tooltip } from "antd";
import { useAntdToken } from "antd-style";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { UserSummary } from "@/features/users/types";
import { Icon } from "@/shared/ui/icon";

type UsersTableProps = {
  canDelete: boolean;
  canUpdate: boolean;
  current: number;
  data: UserSummary[];
  isSystemAdmin: boolean;
  loading: boolean;
  offset: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onManageRoles: (id: string) => void;
  onPageChange: (page: number) => void;
  onPassword: (id: string) => void;
  onStatus: (record: UserSummary) => void;
  onSystemAdmin: (record: UserSummary) => void;
  pageSize: number;
  total: number;
};

export const UsersTable = ({
  canDelete,
  canUpdate,
  current,
  data,
  isSystemAdmin,
  loading,
  offset,
  onDelete,
  onEdit,
  onManageRoles,
  onPageChange,
  onPassword,
  onStatus,
  onSystemAdmin,
  pageSize,
  total,
}: UsersTableProps) => {
  const { t } = useTranslation();
  const token = useAntdToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasActions = canDelete || canUpdate || isSystemAdmin;

  const columns: TableProps<UserSummary>["columns"] = [
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
            onClick={() => onStatus(record)}
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
                        onClick={() => onEdit(record.id)}
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title={t("roles")}>
                      <Button
                        aria-label={t("roles")}
                        icon={<Icon name="key" />}
                        onClick={() => onManageRoles(record.id)}
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
                        onClick={() => onPassword(record.id)}
                        type="text"
                      />
                    </Tooltip>
                    <Tooltip title={t("systemAdmin")}>
                      <Button
                        aria-label={t("systemAdmin")}
                        icon={<Icon name="bolt" />}
                        onClick={() => onSystemAdmin(record)}
                        type="text"
                      />
                    </Tooltip>
                  </>
                )}
                {canDelete && (
                  <Tooltip title={t("delete")}>
                    <Button
                      aria-label={t("delete")}
                      danger
                      icon={<Icon name="delete" />}
                      onClick={() => onDelete(record.id)}
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

  useEffect(() => {
    const scrollRegion =
      containerRef.current?.querySelector<HTMLElement>(".ant-table-content");

    if (!scrollRegion) return;

    scrollRegion.tabIndex = 0;
    scrollRegion.setAttribute("role", "region");
    scrollRegion.setAttribute("aria-label", t("users"));
  }, [data, t]);

  return (
    <div ref={containerRef}>
      <Table<UserSummary>
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={({ current: page }) => onPageChange(page ?? 1)}
        pagination={{
          current,
          pageSize,
          showSizeChanger: false,
          total,
        }}
        rowKey="id"
        scroll={{ x: token.screenXL }}
        size="small"
      />
    </div>
  );
};
