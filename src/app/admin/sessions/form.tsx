import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { AdvencedProFormDatePicker } from "@/components/Form/Fields/AdvencedProFormDatePicker";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { Section } from "@/components/Section";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/hooks/useUser";
import { useUserRoles } from "@/hooks/useUserRoles";
import { SessionType } from "@/utils/enum";
import {
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Typography } from "antd";
import { MatchFields } from "./match-fields";
import { TrainingFields } from "./training-fields";

interface SessionFormProps extends FormProps {
  sessionType: SessionType;
}

export const SessionForm = ({
  title,
  initialValues,
  sessionType,
  ...props
}: SessionFormProps) => {
  const { isOperator } = useUserRoles();
  const { user } = useUser();
  const { makeRequest } = useApi();

  const isEdit = !!initialValues?.id;

  const formRequest = async () => {
    let base = { ...initialValues };

    if (isOperator && !initialValues?.id) {
      const seasonData = await makeRequest(`/api/seasons/all`, "get");
      const seasonTeamData = await makeRequest(`/api/season-teams/all`, "get", {
        filter: {
          season_id: seasonData.data[0].value,
          user_id: user?.id,
        },
      });

      base = {
        ...base,
        season_team: { season_id: seasonData.data[0].value },
        season_team_id: seasonTeamData.data[0].value,
        user_id: user?.id,
      };
    }

    return base;
  };

  return (
    <AdvancedProForm
      {...props}
      initialValues={{ ...initialValues }}
      request={formRequest}
    >
      <FormContent
        isEdit={isEdit}
        sessionType={sessionType}
        isOperator={isOperator}
      />
    </AdvancedProForm>
  );
};

interface FormContentProps {
  isEdit?: boolean;
  sessionType: SessionType;
  isOperator?: boolean;
}

const FormContent = ({ isEdit, sessionType, isOperator }: FormContentProps) => {
  const [form] = ProForm.useForm();

  const title = isEdit
    ? sessionType === SessionType.Training
      ? "Modifica allenamento"
      : "Modifica partita"
    : sessionType === SessionType.Training
    ? "Crea allenamento"
    : "Crea partita";

  return (
    <Section.Grid>
      <Typography.Title level={4}>{title}</Typography.Title>
      <ProFormText name="type" label="Tipo" initialValue={sessionType} hidden />
      <Section.Card title="Dati generali">
        <Section.Grid className="md:grid-cols-4">
          {/* STAGIONE */}
          <ApiSelect
            name={["season_team", "season_id"]}
            label="Stagione"
            url={`/api/seasons/all`}
            onChange={() => {
              form.resetFields(["season_team_id", "user_id"]);
            }}
            disabled={isOperator}
            required
          />

          {/* CATEGORIA */}
          <ProFormDependency name={["season_team", "season_id"]}>
            {({ season_team }, ref) => {
              const label = "Categoria";
              const season_id = season_team?.season_id;

              if (!season_id) {
                return <ProFormSelect disabled label={label} />;
              }

              return (
                <ApiSelect
                  name="season_team_id"
                  label="Categoria"
                  url="/api/season-teams/all"
                  filters={{ season_id }}
                  disabled={isOperator || !season_id}
                  allowClear
                  onChange={() => {
                    form.resetFields(["user_id"]); // better than setFieldValue(null)
                  }}
                  required
                />
              );
            }}
          </ProFormDependency>

          {/* ALLEANTORE */}
          <ProFormDependency
            name={[["season_team", "season_id"], "season_team_id"]}
          >
            {({ season_team, season_team_id }) => {
              const label = "Allenatore";
              const disabled = !season_team?.season_id || !season_team_id;

              if (disabled) {
                return (
                  <ProFormSelect label={label} disabled preserve={false} />
                );
              }

              return (
                <ApiSelect
                  key={`user-${season_team?.season_id}-${season_team_id}`}
                  name="user_id"
                  label={label}
                  url="/api/season-team-users/all"
                  filters={{ season_team_id }}
                  disabled={isOperator || disabled}
                  allowClear
                  required
                  preserve={false}
                />
              );
            }}
          </ProFormDependency>

          {/* DATA */}
          <AdvencedProFormDatePicker name="date" label="Data" required />
        </Section.Grid>
      </Section.Card>

      {sessionType === SessionType.Training && <TrainingFields />}
      {sessionType === SessionType.Match && <MatchFields />}
    </Section.Grid>
  );
};
