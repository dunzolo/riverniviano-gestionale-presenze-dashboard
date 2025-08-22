import { CrudDataTable } from "@/components/CrudDataTable";
import { SessionType } from "@/utils/enum";
import { SessionForm } from "./form";
import { TableAttendances } from "./table-attendances";

export const TableTrainings = () => {
  return (
    <CrudDataTable
      keyName="trainings_detail"
      paged={false}
      form={(props) => (
        <SessionForm sessionType={SessionType.Training} {...props} />
      )}
      url="/api/sessions"
      params={{ type: SessionType.Training }}
      tabs={(item) => {
        return [
          {
            label: "Presenze",
            key: "attendance",
            children: (
              <TableAttendances
                url={`/api/sessions/${item.id}/attendances`}
                date={item.date}
              />
            ),
          },
        ];
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
  );
};
