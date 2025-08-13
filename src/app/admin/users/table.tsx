import { CrudDataTable, CrudDataTableFooter } from "@/components/CrudDataTable";
import { JSX } from "react";
import { Form } from "./form";

export const Table = () => {
  return (
    <CrudDataTable
      form={Form}
      formProps={{
        submitter: {
          searchConfig: {
            submitText: "Salva",
          },
          resetButtonProps: {
            style: { display: "none" },
          },
          render: (props, dom, ...rest) => {
            const email = props.form?.getFieldValue("email");
            return <Submitter email={email} dom={dom} />;
          },
        },
      }}
      url="/api/users"
      actionOnSave="list"
      columns={[
        {
          title: "Nome",
          dataIndex: "name",
          search: true,
          sorter: true,
        },
        {
          title: "Cognome",
          dataIndex: "surname",
          search: true,
          sorter: true,
        },
        {
          title: "E-mail",
          dataIndex: "email",
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

interface SubmitterProps {
  email: string;
  dom: JSX.Element[];
}

const Submitter = ({ email, dom }: SubmitterProps) => {
  return <CrudDataTableFooter>{dom}</CrudDataTableFooter>;
};
