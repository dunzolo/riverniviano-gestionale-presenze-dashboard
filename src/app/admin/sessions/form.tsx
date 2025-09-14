import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { AdvencedProFormDatePicker } from "@/components/Form/Fields/AdvencedProFormDatePicker";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { Section } from "@/components/Section";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/hooks/useUser";
import { useUserRoles } from "@/hooks/useUserRoles";
import { SessionType } from "@/utils/enum";
import { CalendarOutlined, TrophyOutlined } from "@ant-design/icons";
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
  const { isOperator, isAdmin } = useUserRoles();
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
      <FormContent isEdit={isEdit} sessionType={sessionType} />
    </AdvancedProForm>
  );
};

interface FormContentProps {
  isEdit?: boolean;
  sessionType: SessionType;
}

const FormContent = ({ isEdit, sessionType }: FormContentProps) => {
  const { isOperator, isAdmin } = useUserRoles();

  const [form] = ProForm.useForm();

  const title = isEdit ? (
    sessionType === SessionType.Training ? (
      <>
        <CalendarOutlined /> Modifica allenamento
      </>
    ) : (
      <>
        <TrophyOutlined /> Modifica partita
      </>
    )
  ) : sessionType === SessionType.Training ? (
    <>
      <CalendarOutlined /> Crea allenamento
    </>
  ) : (
    <>
      <TrophyOutlined /> Crea partita
    </>
  );

  return (
    <Section.Grid>
      <Typography.Title className="!mb-0" level={4}>
        {title}
      </Typography.Title>
      <ProFormText name="type" label="Tipo" initialValue={sessionType} hidden />

      {/* DATA */}
      <AdvencedProFormDatePicker name="date" label="Data" required />

      {isAdmin && (
        <Section.Card title="Dati generali">
          <Section.Grid className="md:grid-cols-3">
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
          </Section.Grid>
        </Section.Card>
      )}

      {sessionType === SessionType.Training && <TrainingFields />}
      {sessionType === SessionType.Match && <MatchFields />}
    </Section.Grid>
  );
};
