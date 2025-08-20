import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { AdvencedProFormDatePicker } from "@/components/Form/Fields/AdvencedProFormDatePicker";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { FilesUploader } from "@/components/Form/Fields/FilesUploader";
import { NumberInput } from "@/components/Form/Fields/NumberInput";
import { TextEditor } from "@/components/Form/Fields/TextEditor";
import { Section } from "@/components/Section";
import { useApi } from "@/hooks/useApi";
import { useUser } from "@/hooks/useUser";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useValueEnum } from "@/hooks/useValueEnum";
import { SessionType } from "@/utils/enum";
import {
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";

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

  return (
    <AdvancedProForm
      {...props}
      initialValues={{ ...initialValues }}
      request={async () => {
        let base = { ...initialValues };

        if (isOperator && !initialValues?.id) {
          const seasonData = await makeRequest(`/api/seasons/all`, "get");
          const seasonTeamData = await makeRequest(
            `/api/season-teams/all`,
            "get",
            {
              filter: {
                season_id: seasonData.data[0].value,
                user_id: user?.id,
              },
            }
          );

          base = {
            ...base,
            season_team: { season_id: seasonData.data[0].value },
            season_team_id: seasonTeamData.data[0].value,
            user_id: user?.id,
          };
        }

        return base;
      }}
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
  const { valueEnum } = useValueEnum();

  return (
    <Section.Grid>
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

              // if (!season_id) {
              //   return <ProFormSelect disabled label={label} />;
              // }

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

      <Section.Grid className="md:grid-cols-3">
        <Section.Grid className="md:col-span-2">
          {/* DATI SPECIFICI */}
          <Section.Card title="Dati specifici">
            <Section.Grid className="md:grid-cols-2">
              {/* TITOLO */}
              <ProFormText
                name={["training", "title"]}
                label="Titolo"
                required
              />

              <Section.Grid className="md:grid-cols-2">
                {/* DURATA */}
                <NumberInput
                  name={["training", "duration"]}
                  label="Durata"
                  fieldProps={{
                    min: 0,
                    addonBefore: "Minuti",
                  }}
                  required
                />

                {/* DIFFICOLTA' */}
                <ProFormSelect
                  name={["training", "difficulty"]}
                  label="Difficoltà"
                  valueEnum={valueEnum.trainingDifficulties}
                  required
                />
              </Section.Grid>
            </Section.Grid>
          </Section.Card>

          {/* OBIETTIVI */}
          <Section.Card title="Obiettivi">
            <Section.Grid className="md:grid-cols-3">
              {/* CONTENITORE */}
              <ApiSelect
                name={["training", "container_id"]}
                label="Contenitore"
                url="/api/training-containers/all"
                required
              />

              {/* SCOPO */}
              <ApiSelect
                name={["training", "scope_id"]}
                label="Scopo"
                url="/api/training-scopes/all"
                required
              />

              {/* FOCUS */}
              <ProFormText name="focus" label="Focus" />
            </Section.Grid>
          </Section.Card>
        </Section.Grid>

        <Section.Card title="Allegato">
          {/* ALLEGATO */}
          <FilesUploader
            name={"training-attachment"}
            label={undefined}
            multiple={false}
            draggable
            availableExtensions={["pdf", "png", "jpg", "jpeg"]}
            maxFileSize={20 * 1024} // 20 MB in KB
          />
        </Section.Card>
      </Section.Grid>

      {/* METADATA */}
      <Section.Card title="Metadata">
        <Section.Grid className="md:grid-cols-2">
          <TextEditor
            name={["training", "meta", "preparation"]}
            label="Preparazione"
          />
          <TextEditor
            name={["training", "meta", "organization"]}
            label="Organizzazione"
          />
          <TextEditor name={["training", "meta", "rules"]} label="Regole" />
          <TextEditor
            name={["training", "meta", "description"]}
            label="Descrizione"
          />
          <TextEditor
            name={["training", "meta", "variants"]}
            label="Varianti"
          />
          <TextEditor
            name={["training", "meta", "trainer_topics"]}
            label="Temi allenatore"
          />
        </Section.Grid>
      </Section.Card>
    </Section.Grid>
  );
};
