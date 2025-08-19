import { CrudDataTable } from "@/components/CrudDataTable";
import { Form } from "./form";

export const Table = () => {
  return (
    <CrudDataTable
      form={Form}
      url="/api/players"
      actionOnSave="list"
      columns={[
        {
          title: "Cognome",
          dataIndex: ["player", "surname"],
          search: true,
          sorter: true,
        },
        {
          title: "Nome",
          dataIndex: ["player", "name"],
          search: true,
          sorter: true,
        },
        {
          title: "Stagione",
          dataIndex: ["season", "name"],
          valueType: "apiSelect",
          fieldProps: {
            url: "/api/seasons/all",
            name: "season_id",
            mode: "multiple",
          },
          search: true,
          sorter: true,
        },
        {
          title: "Categoria",
          dataIndex: ["team", "name"],
          valueType: "apiSelect",
          fieldProps: {
            url: "/api/teams/all",
            name: "team_id",
            mode: "multiple",
          },
          search: true,
          sorter: true,
        },
        {
          title: "Etichetta",
          dataIndex: "label",
          search: true,
          sorter: true,
        },
        {
          title: "Attivo",
          align: "center",
          dataIndex: ["player", "active"],
          valueType: "boolean",
          search: true,
        },
      ]}
    />
  );
};
