import { DeleteButton } from "@/components/Buttons/DeleteButton";
import { DetailButton } from "@/components/Buttons/DetailButton";
import { CrudDataTable, Tab } from "@/components/CrudDataTable";
import { PolicyProvider } from "@/hooks/usePolicy";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Values } from "@/types";
import { SessionType } from "@/utils/enum";
import { createQueryString } from "@/utils/queryParams";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { ProList } from "@ant-design/pro-components";
import { Button, Divider, Drawer, Tag } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { sessionsColumns } from "./(colums)/sessionColumns";
import { ActionLink } from "./(components)/ActionLink";
import { MatchListTitle } from "./(components)/MatchListTitle";
import { TrainingListTitle } from "./(components)/TrainingListTitle";
import { SessionForm } from "./form";
import { AttendanceForm } from "./form-attendance";

const URL = "sessions";
const API_URL = `/api/${URL}`;

export const Table = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAdmin } = useUserRoles();

  const [open, setOpen] = useState(false);

  const getHrefUrl = (item: Values | undefined) => {
    return `${pathname}?${createQueryString(searchParams, {
      [`${URL}_id`]: item?.["id"],
    })}`;
  };

  const openCreate = (extraType: SessionType) => {
    const newQuery = createQueryString(searchParams, {
      [`${URL}_id`]: "create",
      extra_type: extraType,
    });
    router.push(`${pathname}?${newQuery}`, { scroll: true });
    setOpen(false);
  };

  const getTabs = (item: Values) => {
    const allTabs: Record<string, Tab> = {
      attendance: {
        key: "attendance",
        label: "Presenze",
        children: <AttendanceForm />,
      },
      results: {
        key: "results",
        label: "Risultati",
        children: <>risultati</>,
      },
    };

    if (item.type == SessionType.Training) {
      return ["attendance"].map((key) => allTabs[key]);
    }

    return ["attendance", "results"].map((key) => allTabs[key]);
  };

  return (
    <>
      <CrudDataTable
        paged={false}
        hideCreateButton
        url={API_URL}
        className="[&_.ant-pro-card]:!bg-transparent [&_.ant-pro-card]:!border-none [&_.ant-pro-table-list-toolbar-left]:!hidden [&_.ant-pro-table-list-toolbar-right]:!w-full [&_.ant-pro-table-list-toolbar-right>div]:!w-full"
        form={SessionForm}
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
        tabs={(item) => getTabs(item)}
        columns={sessionsColumns}
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
              className="
                [&_.ant-pro-checkcard-content]:!py-2 
                [&_.ant-pro-checkcard-content]:!pr-1 
                [&_.ant-pro-checkcard-body]:!p-0 
                [&_.ant-pro-checkcard-header-left]:!w-full 
                [&_.ant-pro-checkcard-title]:!w-full 
                [&_.ant-list-item-meta-title]:!w-full"
              metas={{
                title: {
                  render: (_, row) => (
                    <div className="flex items-center justify-between w-full">
                      {row.type === SessionType.Training && (
                        <TrainingListTitle
                          date={row.date}
                          title={row.training?.title}
                          icon={CalendarOutlined}
                        />
                      )}
                      {row.type === SessionType.Match && (
                        <MatchListTitle data={row} />
                      )}
                      <div className="flex items-center">
                        <PolicyProvider authorizations={row?.authorizations}>
                          <DetailButton
                            type="text"
                            variant="icon"
                            url={getHrefUrl(row)}
                          />
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
                  render: (_, row) =>
                    isAdmin && (
                      <div className="flex items-center justify-between w-full sm:max-w-1/2 px-2 pb-2 text-xs font-thin">
                        <span>{`📅 ${row.season_team.season.name}`}</span>
                        <span>
                          {`⚽ ${row.season_team.team.name} - ${row.season_team.label}`}
                        </span>
                        <span>{`👤 ${row.user.full_name}`}</span>
                      </div>
                    ),
                },
                actions: {
                  cardActionProps: "actions",
                  render: (_, row) => [
                    <div className="!flex !items-center !justify-between !w-full">
                      <div className="!pl-2 !flex !gap-1">
                        <Tag
                          key="attendances_count_presents"
                          color="green"
                          className="!px-1 !py-0.5 !m-0"
                        >
                          {row.attendances_count_presents}
                        </Tag>
                        <Tag
                          key="attendances_count_absents"
                          color="red"
                          className="!px-1 !py-0.5 !m-0"
                        >
                          {row.attendances_count_absents}
                        </Tag>
                        <Tag
                          key="attendances_count_lates"
                          color="gold"
                          className="!px-1 !py-0.5 !m-0"
                        >
                          {row.attendances_count_lates}
                        </Tag>
                        <Tag
                          key="attendances_count_injuries"
                          className="!px-1 !py-0.5 !m-0"
                        >
                          {row.attendances_count_injuries}
                        </Tag>
                      </div>
                      <div className="!text-end">
                        <Tag key="scope">{row.training?.scope?.name}</Tag>
                        <Tag key="container">
                          {row.training?.container?.name}
                        </Tag>
                      </div>
                    </div>,
                  ],
                },
              }}
            />
          );
        }}
      />

      <Drawer
        open={open}
        height={"auto"}
        closable={false}
        placement="bottom"
        onClose={() => setOpen(false)}
        className="[&>_.ant-drawer-body]:!p-0"
      >
        <ActionLink
          title="Creare una sessione di allenamento"
          description="Con obiettivi, contenitori e focus"
          className="pt-4"
          onClick={() => openCreate(SessionType.Training)}
        />
        <Divider />
        <ActionLink
          title="Creare una partita"
          description="Con squadra avversario e competizione"
          className="pb-4"
          onClick={() => openCreate(SessionType.Match)}
        />
      </Drawer>
    </>
  );
};
