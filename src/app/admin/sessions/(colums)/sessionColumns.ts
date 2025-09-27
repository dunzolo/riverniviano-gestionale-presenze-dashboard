import { CustomColumn } from "@/components/DataTable";


export const sessionsColumns: CustomColumn[] = [
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
];