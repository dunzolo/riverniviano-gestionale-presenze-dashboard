"use client";

import { ConfirmActionButton } from "@/components/Buttons/ConfirmActionButton";
import { CrudDataTable } from "@/components/CrudDataTable";
import { AttendanceStatusButtons } from "@/containers/attendances/AttendanceStatusButton";
import { useApi } from "@/hooks/useApi";
import { Values } from "@/types";
import { AttendanceStatus } from "@/utils/enum";
import { CheckOutlined, UserOutlined } from "@ant-design/icons";
import { ActionType, ProList, useToken } from "@ant-design/pro-components";
import { Space, Typography } from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";

interface TableAttendancesProps {
  url: string;
  date: string;
}

export const TableAttendances = ({ url, date }: TableAttendancesProps) => {
  const { makeRequest } = useApi();
  const { token } = useToken();

  const [lastData, setLastData] = useState<Values[]>([]);
  const [savingByRow, setSavingByRow] = useState<Record<number, boolean>>({});
  const [localSelections, setLocalSelections] = useState<
    Record<number, AttendanceStatus>
  >({});

  const tableRef = useRef<ActionType>();

  const updateStatus = async (row: Values, next: AttendanceStatus) => {
    const rosterId = row.id;
    const prev = effectiveStatus(row);

    setSavingByRow((m) => ({ ...m, [rosterId]: true }));
    setStatus(rosterId, next);

    try {
      await makeRequest(`${url}/${rosterId}`, "patch", { status: next });
      tableRef?.current?.reload?.();
    } catch (e) {
      if (prev) {
        setStatus(rosterId, prev);
      } else {
        setLocalSelections((m) => {
          const { [rosterId]: _, ...rest } = m;
          return rest;
        });
      }
      console.error(e);
    } finally {
      setSavingByRow((m) => ({ ...m, [rosterId]: false }));
    }
  };

  const setStatus = (rosterId: number, status: AttendanceStatus) => {
    setLocalSelections((prev) => ({ ...prev, [rosterId]: status }));
  };

  const effectiveStatus = (row: Values): AttendanceStatus | null =>
    localSelections[row.id] ?? row.status ?? null;

  const renderActions = () => {
    return [
      <>
        <ConfirmActionButton
          className="!border-[#52c41a] !text-[#52c41a] hover:!bg-[#52c41a] hover:!text-white"
          type="default"
          confirmProps={{
            title: "Segna tutti presenti",
            content: "Sei sicuro di voler segnare tutti i presenti?",
          }}
          method="post"
          url={`${url}/set-all-presents`}
          onSuccess={tableRef?.current?.reload}
        >
          <CheckOutlined />
          Segna tutti presenti
        </ConfirmActionButton>
      </>,
    ];
  };

  return (
    <>
      <Typography.Title level={4}>
        {`Aggiungi presenze attività: ${dayjs(date)
          .format("dddd D MMMM YYYY")
          .toUpperCase()}`}
      </Typography.Title>
      <CrudDataTable
        url={url}
        paged={false}
        actionRef={tableRef}
        actionOnSave="list"
        toolbar={{
          actions: renderActions(),
        }}
        onLoad={(rows: Values[]) => setLastData(rows ?? [])}
        tableViewRender={(tProps, defaultDom) => {
          const rows = (tProps?.dataSource as any[] | undefined) ?? lastData;
          if (!rows.length) return defaultDom;

          const rk = tProps?.rowKey ?? "id";

          return (
            <ProList
              rowKey={rk}
              dataSource={rows}
              loading={tProps?.loading}
              metas={{
                title: {
                  render: (_, row) => (
                    <Space>
                      <UserOutlined
                        className="text-base min-w-[28px] w-[28px] h-[28px] justify-center"
                        style={{
                          color: "white",
                          backgroundColor: token.colorPrimary,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography.Text strong>
                        {row.player?.full_name}
                      </Typography.Text>
                    </Space>
                  ),
                },
                extra: {
                  render: (_, row) => (
                    <AttendanceStatusButtons
                      value={effectiveStatus(row)}
                      onChange={(s) => updateStatus(row, s)}
                      size="small"
                      disabled={!!savingByRow[row.id]}
                    />
                  ),
                },
              }}
            />
          );
        }}
      />
    </>
  );
};
