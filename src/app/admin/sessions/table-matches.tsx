import { CrudDataTable } from "@/components/CrudDataTable";
import { SessionType } from "@/utils/enum";
import { SessionForm } from "./form";

export const TableMatches = () => {
  return (
    <CrudDataTable
      paged={false}
      form={(props) => (
        <SessionForm sessionType={SessionType.Match} {...props} />
      )}
      url="/api/sessions"
      params={{ type: SessionType.Match }}
      actionOnSave="list"
      columns={[
        {
          title: "Data",
        },
        {
          title: "Allenatore",
        },
      ]}
    />
  );
};
