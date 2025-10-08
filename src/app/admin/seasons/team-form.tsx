import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { Roles } from "@/utils/enum";
import { ProFormRadio, ProFormText } from "@ant-design/pro-components";
import { Typography } from "antd";

export const TeamForm = ({ ...props }: FormProps) => {
  const isEdit = !!props?.initialValues?.id;
  return (
    <AdvancedProForm {...props}>
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
    <Section.Grid>
      <Typography.Title className="!mb-0" level={5}>
        <span>Anagrafica</span>
      </Typography.Title>
      <Section.Grid className="md:grid-cols-2">
        <ApiSelect
          name="team_id"
          label="Categoria"
          url="/api/teams/all"
          required
        />
        <ProFormText name="label" label="Etichetta" required />
      </Section.Grid>
      <ApiSelect
        name="user_ids"
        label="Allenatori"
        url="/api/users/all"
        filters={{
          role: Roles.Operator,
        }}
        mode="multiple"
        required
      />
      <Section.Grid className="md:grid-cols-2">
        <ProFormRadio.Group
          fieldProps={{ buttonStyle: "solid" }}
          radioType="button"
          name="mixed_age"
          label={"Squadra mista"}
          initialValue={false}
          options={valueOptions.boolean}
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
    </Section.Grid>
  );
};
