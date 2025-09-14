import { DeleteButton } from "@/components/Buttons/DeleteButton";
import { CrudDataTable } from "@/components/CrudDataTable";
import { PolicyProvider } from "@/hooks/usePolicy";
import { SessionType } from "@/utils/enum";
import {
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { ProList } from "@ant-design/pro-components";
import { Button, Divider, Drawer, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";
import { SessionForm } from "./form";
import { TableAttendances } from "./table-attendances";

export const TableTrainings = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CrudDataTable
        paged={false}
        hideCreateButton
        url="/api/sessions"
        params={{ type: SessionType.Training }}
        keyName="trainings_detail"
        className="[&_.ant-pro-card]:!bg-transparent [&_.ant-pro-card]:!border-none [&_.ant-pro-table-list-toolbar-left]:!hidden [&_.ant-pro-table-list-toolbar-right]:!w-full [&_.ant-pro-table-list-toolbar-right>div]:!w-full"
        form={(props) => (
          <SessionForm sessionType={SessionType.Training} {...props} />
        )}
        toolbar={{
          settings: [],
          actions: [
            <div className="w-full">
              <Button
                key="open-drower"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setOpen(true);
                }}
              >
                Aggiungi
              </Button>
            </div>,
          ],
        }}
        tabs={(item) => {
          return [
            {
              label: "Presenze",
              key: "attendance",
              children: (
                <TableAttendances
                  url={`/api/sessions/${item.id}/attendances`}
                  item={item}
                />
              ),
            },
          ];
        }}
        tableViewRender={(props, defaultDom) => {
          const rows = props?.dataSource as any[] | undefined;
          if (!rows?.length) return defaultDom;

          const rk = props?.rowKey ?? "id";
          return (
            <ProList
              rowKey={rk}
              dataSource={rows}
              loading={props?.loading}
              grid={{ gutter: 8, column: 1 }}
              onItem={(record: any) => {
                return {
                  onClick: () => {
                    console.debug(record);
                  },
                };
              }}
              className="
                [&_.ant-pro-checkcard-content]:!py-2 
                [&_.ant-pro-checkcard-content]:!pr-1 
                [&_.ant-pro-checkcard-body]:!px-4 
                [&_.ant-pro-checkcard-body]:!pt-2 
                [&_.ant-pro-checkcard-body]:!p-0 
                [&_.ant-pro-checkcard-header-left]:!w-full 
                [&_.ant-pro-checkcard-title]:!w-full 
                [&_.ant-list-item-meta-title]:!w-full"
              metas={{
                title: {
                  render: (_, row) => (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <strong>{dayjs(row.date).format("D")}</strong>
                          <strong>
                            {dayjs(row.date).format("MMM").toUpperCase()}
                          </strong>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-thin">
                            {row.training.title}
                          </span>
                          <div className="flex items-center gap-2 text-gray-400">
                            <CalendarOutlined />
                            <span className="font-light">
                              {dayjs(row.date).format("dddd")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DetailButton item={row} />
                        <PolicyProvider authorizations={row?.authorizations}>
                          <DeleteButton
                            type="text"
                            variant="icon"
                            url={`sessions/${row.id}`}
                            onSuccess={() => {
                              setOpen(false);
                            }}
                          />
                        </PolicyProvider>
                      </div>
                    </div>
                  ),
                },
                content: {
                  render: (_, row) => (
                    <div className="flex items-center gap-2 w-full pb-3">
                      <Tag>{row.season_team.season.name}</Tag>
                      <Tag>
                        {row.season_team.team.name} - {row.season_team.label}
                      </Tag>
                      <Tag>{row.user.full_name}</Tag>
                    </div>
                  ),
                },
                actions: {
                  cardActionProps: "actions",
                  render: (_, row) => [
                    <div className="!flex !items-center !justify-between !w-full">
                      <div className="pl-2 flex flex-wrap gap-1">
                        <Tag
                          key="attendances_count_presents"
                          color="green"
                          className="!mr-1 !px-1 !py-0.5"
                        >
                          {row.attendances_count_presents}
                        </Tag>
                        <Tag
                          key="attendances_count_absents"
                          color="red"
                          className="!mr-1 !px-1 !py-0.5"
                        >
                          {row.attendances_count_absents}
                        </Tag>
                        <Tag
                          key="attendances_count_lates"
                          color="gold"
                          className="!mr-1 !px-1 !py-0.5"
                        >
                          {row.attendances_count_lates}
                        </Tag>
                        <Tag
                          key="attendances_count_injuries"
                          className="!mr-1 !px-1 !py-0.5"
                        >
                          {row.attendances_count_injuries}
                        </Tag>
                      </div>
                      <div>
                        <Tag key="scope">{row.training.scope.name}</Tag>
                        <Tag key="container">{row.training.container.name}</Tag>
                      </div>
                    </div>,
                  ],
                },
              }}
            />
          );
        }}
        columns={[
          {
            width: 100,
            title: "Data",
            dataIndex: "date",
            valueType: "proDate",
            search: true,
            sorter: true,
          },
          {
            width: 100,
            title: "Stagione",
            dataIndex: ["season_team", "season", "name"],
            valueType: "apiSelect",
            fieldProps: {
              url: "/api/seasons/all",
              name: "season_id",
              mode: "multiple",
            },
            search: true,
          },
          {
            width: 100,
            title: "Categoria",
            dataIndex: ["season_team", "team", "name"],
            valueType: "apiSelect",
            fieldProps: {
              url: "/api/teams/all",
              name: "team_id",
              mode: "multiple",
            },
            search: true,
          },
          {
            title: "Etichetta",
            dataIndex: ["season_team", "label"],
            search: true,
          },
          {
            title: "Allenatore",
            dataIndex: ["user", "full_name"],
            valueType: "apiSelect",
            fieldProps: {
              url: "/api/users/all",
              name: "user_id",
              mode: "multiple",
            },
            search: true,
          },
          {
            title: "Titolo",
            dataIndex: ["training", "title"],
            detail: true,
            search: true,
          },
          {
            title: "Scopo",
            dataIndex: ["training", "scope", "name"],
            valueType: "apiSelect",
            fieldProps: {
              url: "/api/training-scopes/all",
              name: "scope_id",
              mode: "multiple",
            },
            search: true,
          },
          {
            title: "Contenitore",
            dataIndex: ["training", "container", "name"],
            valueType: "apiSelect",
            fieldProps: {
              url: "/api/training-containers/all",
              name: "container_id",
              mode: "multiple",
            },
            search: true,
          },
        ]}
      />

      <Drawer
        open={open}
        height={"auto"}
        closable={false}
        placement="bottom"
        onClose={() => setOpen(false)}
        className="[&>_.ant-drawer-body]:!p-0"
      >
        <Link
          href="/admin/sessions?trainings_detail_id=create"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center gap-2 mt-4 px-3">
            <CalendarOutlined
              className="text-base min-w-[36px] w-[36px] h-[36px] justify-center"
              style={{
                color: "var(--color-primary-default)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--color-primary-default)",
                borderRadius: "50%",
              }}
            />
            <div>
              <strong>Creare una sessione di allenamento</strong>
              <div className="text-xs text-gray-500">
                Con obiettivi, contenitori e focus
              </div>
            </div>
          </div>
        </Link>
        <Divider />
        <Link
          href="/admin/sessions?sessions_tab=matches&matches_detail_id=create"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center gap-2 px-3 mb-4">
            <TrophyOutlined
              className="text-base min-w-[36px] w-[36px] h-[36px] justify-center"
              style={{
                color: "var(--color-primary-default)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--color-primary-default)",
                borderRadius: "50%",
              }}
            />
            <div>
              <strong>Creare una partita</strong>
              <div className="text-xs text-gray-500">
                Con squadra avversario e competizione
              </div>
            </div>
          </div>
        </Link>
      </Drawer>
    </>
  );
};

const DetailButton = ({ item }: { item: any }) => {
  return (
    <Link
      href={{
        pathname: "sessions",
        query: {
          trainings_detail_id: item.id,
        },
      }}
    >
      <Tooltip title={"Modifica"}>
        <Button type="text" size="small">
          <EditOutlined />
        </Button>
      </Tooltip>
    </Link>
  );
};
