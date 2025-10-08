"use client";

import { useCrudDataTable } from "@/components/CrudDataTable";
import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { AdvencedProFormDatePicker } from "@/components/Form/Fields/AdvencedProFormDatePicker";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { MaskedInputHour } from "@/components/Form/Fields/Masked/MaskedInputHour";
import { Section } from "@/components/Section";
import { useRole } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Roles, SessionType } from "@/utils/enum";
import { CalendarOutlined, TrophyOutlined } from "@ant-design/icons";
import {
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { MatchFields } from "./(form)/MatchFields";
import { TrainingFields } from "./(form)/TrainingFields";

export const SessionForm = ({ ...props }: FormProps) => {
  const { user } = useUser();
  const { item } = useCrudDataTable();
  const isOperator = useRole(Roles.Operator);

  const initialValues = { ...props.initialValues };
  const isEdit = !!initialValues?.id;
  const hasMoreTeams = user?.has_more_teams;
  const isOperatorCreate = isOperator && !isEdit;

  const searchParams = useSearchParams();
  const sessionType: SessionType = item?.type ?? searchParams.get("extra_type");

  if (!sessionType) {
    return <></>;
  }

  return (
    <AdvancedProForm
      {...props}
      initialValues={{
        ...initialValues,
        type: sessionType,
        season_team: {
          season_id: isOperatorCreate
            ? user?.season_id
            : initialValues?.season_team?.season_id,
        },
        season_team_id: isOperatorCreate
          ? user?.season_team_id
          : initialValues?.season_team_id,
        user_id: isOperatorCreate ? user?.id : initialValues?.user_id,
      }}
    >
      <FormContent
        isEdit={isEdit}
        sessionType={sessionType}
        hasMoreTeams={hasMoreTeams}
      />
    </AdvancedProForm>
  );
};

interface FormContentProps {
  isEdit?: boolean;
  sessionType: SessionType;
  hasMoreTeams?: boolean;
}

const FormContent = ({
  isEdit,
  sessionType,
  hasMoreTeams,
}: FormContentProps) => {
  const isOperator = useRole(Roles.Operator);
  const isAdmin = useRole(Roles.FullAccess);
  const form = ProForm.useFormInstance();

  const isMatch = sessionType === SessionType.Match;
  const isTraining = sessionType === SessionType.Training;

  const config = {
    training: {
      icon: <CalendarOutlined />,
      create: "Crea allenamento",
      edit: "Modifica allenamento",
    },
    match: {
      icon: <TrophyOutlined />,
      create: "Crea partita",
      edit: "Modifica partita",
    },
  };

  const Title = () => {
    if (!sessionType) return null;

    const icon = config[sessionType].icon;
    const text = isEdit ? config[sessionType].edit : config[sessionType].create;
    return (
      <>
        {icon} {text}
      </>
    );
  };

  return (
    <Section.Grid>
      <Typography.Title className="!mb-0" level={4}>
        <Title />
      </Typography.Title>

      {/* HIDDEN */}
      <ProFormText name="type" hidden />
      {isOperator && (
        <>
          <ProFormText name={["season_team", "season_id"]} hidden />
          <ProFormText name="season_team_id" hidden />
          <ProFormText name="user_id" hidden />
        </>
      )}

      {/* DATA */}
      <AdvencedProFormDatePicker name="date" label="Data" required />

      {/* ORA */}
      {isMatch && (
        <MaskedInputHour
          name={"hour"}
          label={"Ora"}
          fieldProps={{
            placeholder: "oo:mm",
          }}
          required
        />
      )}

      {isOperator && hasMoreTeams && (
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
                filters={{ season_id, user_id: form.getFieldValue("user_id") }}
                disabled={isEdit}
                onChange={(_, option: any) => {
                  // eseguo il set del campo game.category
                  // se la sessione è di tipo partita e la categoria selezionataè di età mista
                  if (option?.mixed_age && isMatch) {
                    form.setFieldValue(["game", "category"], "mixed_age");
                  }
                }}
                allowClear
                required
              />
            );
          }}
        </ProFormDependency>
      )}

      {isAdmin && (
        <Section.Card title="Dati generali">
          <Section.Grid className="md:grid-cols-3">
            {/* STAGIONE */}
            <ApiSelect
              name={["season_team", "season_id"]}
              label="Stagione"
              url={`/api/seasons/all`}
              onChange={() => {
                form.setFieldValue("user_id", null);
                form.setFieldValue("season_team_id", null);
              }}
              allowClear
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
                    disabled={!season_id}
                    onChange={() => {
                      form.setFieldValue("user_id", null);
                    }}
                    allowClear
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
                  return <ProFormSelect label={label} disabled />;
                }

                return (
                  <ApiSelect
                    key={`user-${season_team?.season_id}-${season_team_id}`}
                    name="user_id"
                    label={label}
                    url="/api/season-team-users/all"
                    filters={{ season_team_id }}
                    disabled={disabled}
                    allowClear
                    required
                  />
                );
              }}
            </ProFormDependency>
          </Section.Grid>
        </Section.Card>
      )}

      {isTraining && <TrainingFields />}
      {isMatch && <MatchFields isEdit={isEdit} />}
    </Section.Grid>
  );
};
