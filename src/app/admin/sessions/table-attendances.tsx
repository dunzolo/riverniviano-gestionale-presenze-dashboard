"use client";

import { ConfirmActionButton } from "@/components/Buttons/ConfirmActionButton";
import { CrudDataTableFooter } from "@/components/CrudDataTable";
import { AdvancedProForm } from "@/components/Form/AdvancedProForm";
import { AttendanceStatusButtons } from "@/containers/attendances/AttendanceStatusButton";
import { useApi } from "@/hooks/useApi";
import { Values } from "@/types";
import { AttendanceStatus, SessionType } from "@/utils/enum";
import { CheckOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { ActionType, ProList, useToken } from "@ant-design/pro-components";
import { Checkbox, InputNumber, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

interface TableAttendancesProps {
  url: string;
  item: Values;
}

export const TableAttendances = ({ url, item }: TableAttendancesProps) => {
  const { makeRequest, isLoading } = useApi();
  const { token } = useToken();

  const [lastData, setLastData] = useState<Values[]>([]);
  const [savingByRow, setSavingByRow] = useState<Record<number, boolean>>({});
  const [localSelections, setLocalSelections] = useState<
    Record<number, AttendanceStatus>
  >({});

  const tableRef = useRef<ActionType>();
  const rowPath = (id: number, field: string | (string | number)[]) => [
    "attendances",
    String(id),
    ...(Array.isArray(field) ? field : [field]),
  ];

  useEffect(() => {
    makeRequest(url).then((data) => setLastData(data?.data ?? []));
  }, []);

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
      // setSavingByRow((m) => ({ ...m, [rosterId]: false }));
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
      <Typography.Title level={4} className="!mb-0">
        <div className="flex flex-col items-center">
          <div>
            {item.type === SessionType.Training ? (
              <>{item.training?.title}</>
            ) : (
              <TrophyOutlined />
            )}
          </div>
          <div className="text-sm font-light text-gray-500">
            {dayjs(item.date).format("dddd D MMMM YYYY")}
          </div>
        </div>
      </Typography.Title>

      <AdvancedProForm
        url={url}
        submitter={{
          resetButtonProps: {
            style: { display: "none" },
          },
          searchConfig: {
            submitText: "Salva",
          },
          render(props, dom) {
            return <CrudDataTableFooter>{dom}</CrudDataTableFooter>;
          },
        }}
      >
        <ProList
          name="attendances"
          dataSource={lastData}
          loading={isLoading}
          grid={{ gutter: 8, column: 1 }}
          className="
                [&_.ant-pro-checkcard-content]:!py-2
                [&_.ant-pro-checkcard-body]:!px-4
                [&_.ant-pro-checkcard-body]:!p-0
                [&_.ant-pro-checkcard-header-left]:!w-full 
                [&_.ant-pro-checkcard-title]:!w-full 
                [&_.ant-list-item-meta-title]:!w-full
                [&_.ant-pro-checkcard-bordered]:!m-0"
          metas={{
            title: {
              render: (_, row) => (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserOutlined
                      className="text-base min-w-[24px] w-[24px] h-[24px] justify-center"
                      style={{
                        color: "white",
                        backgroundColor: token.colorPrimary,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography.Text className="!text-sm">
                      {row.player?.full_name}
                    </Typography.Text>
                  </div>
                  <div>
                    <AdvancedProForm.Item
                      name={rowPath(row.id, "status")}
                      initialValue={effectiveStatus(row)}
                      noStyle
                    >
                      <AttendanceStatusButtons size="small" />
                    </AdvancedProForm.Item>
                    {/* <AttendanceStatusButtons
                      value={effectiveStatus(row)}
                      onChange={(s) => updateStatus(row, s)}
                      size="small"
                      disabled={!!savingByRow[row.id]}
                    /> */}
                  </div>
                </div>
              ),
            },
            actions: {
              cardActionProps: "actions",
              render: (_, row) => {
                // imposto le azioni come undefined per non mostrare la riga vuota
                if (
                  row.status !== AttendanceStatus.Present ||
                  row.status === AttendanceStatus.Injury
                ) {
                  return undefined;
                }

                return [
                  <div className="!w-full !px-2">
                    <div className="!grid !grid-cols-2 !gap-2">
                      <AdvancedProForm.Item
                        name={rowPath(row.id, "id")}
                        initialValue={row.id}
                        hidden
                      >
                        <input />
                      </AdvancedProForm.Item>
                      <div className="col-span-2 !flex !items-center !justify-between gap-2">
                        <AdvancedProForm.Item
                          name={rowPath(row.id, "minutes_played")}
                          noStyle
                        >
                          <strong>🕛 Minuti giocati</strong>
                          <InputNumber />
                        </AdvancedProForm.Item>
                      </div>
                      <div className="col-span-2 !flex !items-center !justify-between gap-2">
                        <AdvancedProForm.Item
                          name={rowPath(row.id, "goals")}
                          noStyle
                        >
                          <strong>⚽ Goal</strong>
                          <InputNumber />
                        </AdvancedProForm.Item>
                      </div>
                      <div className="col-span-2 !flex !items-center !justify-between gap-2">
                        <AdvancedProForm.Item
                          name={rowPath(row.id, "assists")}
                          noStyle
                        >
                          <strong>👟 Assist</strong>
                          <InputNumber />
                        </AdvancedProForm.Item>
                      </div>
                      <AdvancedProForm.Item
                        name={rowPath(row.id, "yellow_card")}
                        noStyle
                      >
                        <Checkbox>🟨 Ammonito</Checkbox>
                      </AdvancedProForm.Item>
                      <AdvancedProForm.Item
                        name={rowPath(row.id, "red_card")}
                        noStyle
                      >
                        <Checkbox>🟥 Espulso</Checkbox>
                      </AdvancedProForm.Item>
                    </div>
                  </div>,
                ];
              },
            },
          }}
        />
      </AdvancedProForm>
    </>
  );
};
