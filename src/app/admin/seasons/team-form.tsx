import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { UserTypes } from "@/utils/enum";
import { ProFormRadio, ProFormText } from "@ant-design/pro-components";

export const TeamForm = ({ title, initialValues, ...props }: FormProps) => {
  const isEdit = !!initialValues?.id;
  return (
    <AdvancedProForm
      {...props}
      initialValues={{ ...initialValues, active: true }}
    >
      <TeamFormContent isEdit={isEdit} />
    </AdvancedProForm>
  );
};

interface TeamFormContentProps {
  isEdit?: boolean;
}

const TeamFormContent = ({ isEdit }: TeamFormContentProps) => {
  const { valueOptions } = useValueEnum();

  return (
    <Section.Card title="Anagrafica">
      <Section.Grid className="md:grid-cols-2">
        <ApiSelect
          name="team_id"
          label="Categoria"
          url="/api/teams/all"
          required
        />
        <ProFormText name="label" label="Etichetta" required />
        <ApiSelect
          name="user_ids"
          label="Allenatori"
          url="/api/users/all"
          filters={{
            role: UserTypes.Operator,
          }}
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
