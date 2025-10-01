import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { NumberInput } from "@/components/Form/Fields/NumberInput";
import { TextEditor } from "@/components/Form/Fields/TextEditor";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { GameCategory, GameCompetition } from "@/utils/enum";
import {
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";

interface MatchFieldsProps {
  isEdit?: boolean;
}

export const MatchFields = ({ isEdit }: MatchFieldsProps) => {
  const { valueEnum } = useValueEnum();

  const competition = ProForm.useWatch(["game", "competition"]);
  const seasonId = ProForm.useWatch(["season_team", "season_id"]);

  return (
    <>
      <Section.Card title="Dati specifici">
        <Section.Grid className="md:grid-cols-4">
          {/* AVVERSARIO */}
          <ProFormText
            name={["game", "opponent"]}
            label="Avversario"
            required
          />

          {/* COMPETIZIONE */}
          <ProFormSelect
            name={["game", "competition"]}
            label="Competizione"
            valueEnum={valueEnum.gameCompetitions}
            required
          />

          {competition === GameCompetition.League && (
            <NumberInput
              name={["game", "league_round"]}
              label="Giornata"
              fieldProps={{
                min: 0,
                addonBefore: "Giornata",
              }}
              required
            />
          )}

          {competition === GameCompetition.Tournament && (
            <ProFormText
              name={["game", "tournament_name"]}
              label="Nome torneo"
              required
            />
          )}

          {/* GRUPPO */}
          <ProFormSelect
            name={["game", "category"]}
            label="Gruppo"
            valueEnum={valueEnum.gameCategories}
          />

          {/* CATEGORIE */}
          <ProFormDependency name={["game", "category"]}>
            {({ game }) => {
              const category = game?.category;

              if (category !== GameCategory.MixedAge || isEdit) {
                return null;
              }

              return (
                <ApiSelect
                  name={["game", "team_ids"]}
                  label="Categorie"
                  url="/api/season-teams/all"
                  filters={{
                    season_id: seasonId,
                  }}
                  mode="multiple"
                  allowClear
                  required
                />
              );
            }}
          </ProFormDependency>
        </Section.Grid>
      </Section.Card>

      {/* METADATA */}
      <Section.Card
        title="Informazioni aggiuntive"
        collapsible
        defaultCollapsed
      >
        <Section.Grid className="md:grid-cols-2">
          <TextEditor
            name={["game", "meta", "description"]}
            label="Descrizione"
          />
          <TextEditor
            name={["game", "meta", "trainer_topics"]}
            label="Temi allenatore"
          />
        </Section.Grid>
      </Section.Card>
    </>
  );
};
