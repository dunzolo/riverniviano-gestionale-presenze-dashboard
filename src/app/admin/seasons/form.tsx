import { CrudDataTable, useCrudDataTable } from "@/components/CrudDataTable";
import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { AdvencedProFormDatePicker } from "@/components/Form/Fields/AdvencedProFormDatePicker";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { ProFormRadio, ProFormText } from "@ant-design/pro-components";
import { Form } from "antd";
import { Dayjs } from "dayjs";
import { TeamForm } from "./team-form";

export const SeasonForm = ({ title, initialValues, ...props }: FormProps) => {
  const isEdit = !!initialValues?.id;
  return (
    <AdvancedProForm {...props} initialValues={{ ...initialValues }}>
      <SeasonFormContent isEdit={isEdit} />
    </AdvancedProForm>
  );
};

interface SeasonFormContentProps {
  isEdit?: boolean;
}

const SeasonFormContent = ({ isEdit }: SeasonFormContentProps) => {
  const { valueOptions } = useValueEnum();
  const { item } = useCrudDataTable();

  const form = Form.useFormInstance();

  return (
    <Section.Grid>
      <Section.Card title="Anagrafica">
        <Section.Grid className="md:grid-cols-4">
          <ProFormText name="name" label="Nome" required />
          <AdvencedProFormDatePicker
            name="starts_on"
            label="Data inizio"
            fieldProps={{
              picker: "month",
              format: "MM/YYYY",
              className: "w-full",
              onChange: (date: Dayjs) => {
                form.setFieldValue("starts_on", date.format("YYYY-MM-01"));
              },
            }}
            required
          />
          <AdvencedProFormDatePicker
            name="ends_on"
            label="Data fine"
            fieldProps={{
              picker: "month",
              format: "MM/YYYY",
              className: "w-full",
              onChange: (date: Dayjs) => {
                form.setFieldValue("ends_on", date.format("YYYY-MM-01"));
              },
            }}
            required
          />
          <ProFormRadio.Group
            fieldProps={{ buttonStyle: "solid" }}
            radioType="button"
            name="active"
            label={"Attivo"}
            initialValue={true}
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
