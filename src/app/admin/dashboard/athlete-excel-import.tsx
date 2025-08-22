"use client";

import dayjs from "@/lib/dayjs";
import { PlayCircleOutlined } from "@ant-design/icons";
import { App, Button, Card, Flex, List, Tag, Typography, message } from "antd";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";

// 👇 importa i tuoi componenti
import { AdvancedProForm } from "@/components/Form/AdvancedProForm";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { FilesUploader } from "@/components/Form/Fields/FilesUploader";
import { Values } from "@/types";

const { Text } = Typography;

type MediaItem = {
  id: number;
  uuid: string;
  name: string;
  size: number; // bytes
  mime_type?: string;
  created_at: string; // ISO
};

type FilesResponse = {
  files: MediaItem[];
  latest_id?: number | null;
};

type AthleteExcelImportProps = {
  uploadUrl?: string; // NON usato: ora usiamo FilesUploader → /api/attachments
  listUrl?: string; // default: /api/imports/athletes/files
  runUrl?: string; // default: /api/imports/athletes/run
  defaultSeasonId?: number;
};

export const AthleteExcelImport = ({
  listUrl = "/api/imports/athletes/files",
  runUrl = "/api/players/import",
  defaultSeasonId,
}: AthleteExcelImportProps) => {
  const [seasonId, setSeasonId] = useState<number | undefined>(defaultSeasonId);
  const [files, setFiles] = useState<Values[]>([]);
  const [latestId, setLatestId] = useState<number | undefined>();
  const [selectedMediaId, setSelectedMediaId] = useState<number | undefined>();
  const [loadingList, setLoadingList] = useState(false);
  const [running, setRunning] = useState(false);

  const { modal } = App.useApp();

  // axios + sanctum
  axios.defaults.withCredentials = true;
  axios.defaults.xsrfCookieName = "XSRF-TOKEN";
  axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

  const fetchFiles = useCallback(async () => {
    if (!seasonId) return; // serve la stagione per filtrare i media
    try {
      setLoadingList(true);
      const { data } = await axios.get<FilesResponse>(
        `${listUrl}?season_id=${seasonId}`
      );
      setFiles(data.files ?? []);
      const latest = data.latest_id ?? data.files?.[0]?.id;
      setLatestId(latest);
      setSelectedMediaId((prev) => prev ?? latest);
    } catch (e: any) {
      console.error(e);
      message.error("Impossibile caricare lo storico dei file.");
    } finally {
      setLoadingList(false);
    }
  }, [listUrl, seasonId]);

  // useEffect(() => {
  //   fetchFiles();
  // }, [fetchFiles]);

  // storage per l’attachments route (local in dev, r2 in prod…)
  const uploadStorage = useMemo(
    () => process.env.NEXT_PUBLIC_UPLOAD_DISK ?? "local",
    []
  );

  const runImport = async () => {
    if (!seasonId) {
      message.warning("Seleziona una stagione.");
      return;
    }
    if (!selectedMediaId && files.length === 0) {
      message.warning("Nessun file disponibile per l’import.");
      return;
    }
    modal.confirm({
      title: "Confermi l'import?",
      content:
        "Verranno importati/aggiornati gli atleti e assegnati alla squadra in base al file selezionato.",
      okText: "Importa",
      cancelText: "Annulla",
      onOk: async () => {
        try {
          setRunning(true);
          await axios.post(runUrl, {
            season_id: seasonId,
            media_id: selectedMediaId, // se assente, il backend userà il più recente
          });
          message.success(
            "Import avviato! Controlla lo stato nella sezione log/job."
          );
        } catch (e: any) {
          console.error(e);
          message.error(
            e?.response?.data?.message ?? "Errore nell'avvio dell'import."
          );
        } finally {
          setRunning(false);
        }
      },
    });
  };

  return (
    <Card
      title="Import atleti da Excel"
      // extra={
      //   <Button
      //     icon={<ReloadOutlined />}
      //     onClick={fetchFiles}
      //     loading={loadingList}
      //   >
      //     Aggiorna
      //   </Button>
      // }
      className="max-w-5xl"
    >
      <AdvancedProForm
        // form "usa e getta": serve solo per il FilesUploader
        submitter={false}
        onFinish={async () => true}
      >
        <Flex vertical gap={16}>
          {/* Selezione stagione */}
          <Flex gap={8} align="center">
            <ApiSelect
              url="/api/seasons/all"
              name="season_id"
              label="Stagione"
              onChange={(v) => {
                setSeasonId(v);
                // reset selezione quando cambia stagione
                setSelectedMediaId(undefined);
              }}
              style={{ minWidth: 240 }}
            />
          </Flex>

          {/* Upload con il TUO FilesUploader */}
          <Card size="small" title="Carica file (Excel/CSV)">
            <FilesUploader
              name="attachments"
              label={undefined}
              url="/api/attachments" // 👉 API Route Next (proxy)
              storage={uploadStorage} // es. local | r2
              multiple={false}
              draggable
              availableExtensions={["xlsx", "xls", "csv"]}
              maxFileSize={20 * 1024} // 20 MB in KB
              onChange={(_, files) => {
                // appena cambia la lista (done), ricarico lo storico
                // (può essere chiamato più volte, va benissimo)
                //fetchFiles();
                setFiles(files);
              }}
              // opzionali:
              // uploadChunk={false}
              // imgCropProps={...}
            >
              {/* niente children custom: FilesUploader renderizza il dragger */}
            </FilesUploader>
            <Text type="secondary">
              Il file verrà salvato nello storage (<b>{uploadStorage}</b>) e
              mantenuto come storico.
            </Text>
          </Card>

          {/* Storico file + selezione */}
          <Card
            size="small"
            title="Storico file caricati"
            loading={loadingList}
          >
            {!seasonId ? (
              <Text type="secondary">
                Seleziona una stagione per vedere i file.
              </Text>
            ) : files.length === 0 ? (
              <Text type="secondary">Nessun file caricato finora.</Text>
            ) : (
              <List
                dataSource={files}
                renderItem={(item) => {
                  const isLatest = item.uuid === latestId;
                  const selected = item.uuid === selectedMediaId;
                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="use"
                          type={selected ? "primary" : "default"}
                          size="small"
                          onClick={() => setSelectedMediaId(item.uuid)}
                        >
                          {selected ? "Selezionato" : "Usa questo"}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Flex gap={8} align="center" wrap>
                            <Text>{item.name}</Text>
                            {isLatest && <Tag color="blue">Ultimo</Tag>}
                            {selected && <Tag color="green">Selezionato</Tag>}
                          </Flex>
                        }
                        description={
                          <Flex gap={16} wrap>
                            <Text type="secondary">
                              Caricato il{" "}
                              {dayjs(item.created_at).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </Text>
                            <Text type="secondary">
                              {item.size
                                ? `${(item.size / 1024 / 1024).toFixed(2)} MB`
                                : ""}
                            </Text>
                            {item.mime_type && (
                              <Text type="secondary">{item.mime_type}</Text>
                            )}
                          </Flex>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>

          {/* Azione import */}
          <Flex gap={8}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runImport}
              loading={running}
              disabled={!seasonId || files.length === 0}
            >
              Avvia import dal file selezionato
            </Button>
            {/* <Button
              icon={<CloudUploadOutlined />}
              onClick={fetchFiles}
              disabled={loadingList}
            >
              Ricarica elenco
            </Button> */}
          </Flex>

          <Text type="secondary">
            Suggerimento: lascia selezionato <b>Ultimo</b> per importare sempre
            il file più recente.
          </Text>
        </Flex>
      </AdvancedProForm>
    </Card>
  );
};
