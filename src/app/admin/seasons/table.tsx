"use client";

import { CrudDataTable } from "@/components/CrudDataTable";
import { Form } from "./form";

export const Table = () => {
  return (
    <CrudDataTable
      form={Form}
      url="/api/seasons"
      actionOnSave="list"
      columns={[
        {
          title: "Nome",
          dataIndex: "name",
          search: true,
          sorter: true,
          detail: true,
        },
        {
          title: "Inizio",
          dataIndex: "starts_on",
          search: true,
          sorter: true,
        },
        {
          title: "Fine",
          dataIndex: "ends_on",
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
