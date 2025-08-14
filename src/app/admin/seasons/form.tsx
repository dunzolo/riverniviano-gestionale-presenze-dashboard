import { CrudDataTable, useCrudDataTable } from "@/components/CrudDataTable";
import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { ProFormRadio, ProFormText } from "@ant-design/pro-components";
import { TeamForm } from "./team-form";

export const Form = ({ title, initialValues, ...props }: FormProps) => {
  const isEdit = !!initialValues?.id;
  return (
    <AdvancedProForm
      {...props}
      initialValues={{ ...initialValues, active: true }}
    >
      <FormContent isEdit={isEdit} />
    </AdvancedProForm>
  );
};

interface FormContentProps {
  isEdit?: boolean;
}

const FormContent = ({ isEdit }: FormContentProps) => {
  const { valueOptions } = useValueEnum();
  const { item } = useCrudDataTable();

  return (
    <Section.Grid>
      <Section.Card title="Anagrafica">
        <Section.Grid className="md:grid-cols-2">
          <ProFormText name="name" label="Nome" required />
          <ProFormRadio.Group
            fieldProps={{ buttonStyle: "solid" }}
            radioType="button"
            name="active"
            label={"Attivo"}
            options={valueOptions.active}
          />
        </Section.Grid>
      </Section.Card>
      {item && (
        <Section.Card title="Squadre">
          <CrudDataTable
            form={TeamForm}
            paged={false}
            url={`/api/seasons/${item.id}/season-teams`}
            actionOnSave="list"
            type="modal"
            columns={[
              {
                title: "Categoria",
                dataIndex: ["team", "name"],
              },
              {
                title: "Etichetta",
                dataIndex: "label",
              },
              {
                title: "Allenatori",
                dataIndex: ["users"],
                valueType: "pluck",
                fieldProps: {
                  keyName: "full_name",
                },
              },
              {
                title: "Attivo",
                align: "center",
                dataIndex: "active",
                valueType: "boolean",
              },
            ]}
          />
        </Section.Card>
      )}
    </Section.Grid>
  );
};
