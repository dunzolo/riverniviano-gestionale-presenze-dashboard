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
          dataIndex: "surname",
          search: true,
          sorter: true,
        },
        {
          title: "Nome",
          dataIndex: "name",
          search: true,
          sorter: true,
        },
        {
          title: "Attivo",
          align: "center",
          dataIndex: "active",
          valueType: "boolean",
          search: true,
        },
      ]}
    />
  );
};
