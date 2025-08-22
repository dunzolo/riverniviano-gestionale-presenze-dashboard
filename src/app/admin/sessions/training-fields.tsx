import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { FilesUploader } from "@/components/Form/Fields/FilesUploader";
import { NumberInput } from "@/components/Form/Fields/NumberInput";
import { TextEditor } from "@/components/Form/Fields/TextEditor";
import { Section } from "@/components/Section";
import { useValueEnum } from "@/hooks/useValueEnum";
import { ProFormSelect, ProFormText } from "@ant-design/pro-components";

export const TrainingFields = () => {
  const { valueEnum } = useValueEnum();
  return (
    <>
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
            maxFileSize={10 * 1024} // 10 MB in KB
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
    </>
  );
};
