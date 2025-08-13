import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { PasswordField } from "@/components/Form/Fields/PasswordField";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { ProFormRadio, ProFormText } from "@ant-design/pro-components";

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

  return (
    <Section.Card title="Anagrafica">
      <Section.Grid className="md:grid-cols-2">
        <ProFormText name="name" label="Nome" required />
        <ProFormText name="surname" label="Cognome" required />
        <ProFormText name="email" label="E-mail" required />
        {!isEdit && (
          <PasswordField name="password" label={"Password"} required />
        )}
        <ApiSelect
          name="role_ids"
          label={"Ruolo"}
          url={`/api/roles/all`}
          mode="multiple"
          required
        />
        <ProFormRadio.Group
          fieldProps={{ buttonStyle: "solid" }}
          radioType="button"
          name="active"
          label={"Attivo"}
          options={valueOptions.active}
        />
      </Section.Grid>
    </Section.Card>
  );
};
