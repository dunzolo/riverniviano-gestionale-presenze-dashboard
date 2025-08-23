import { useApi } from "@/hooks/useApi";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  MailOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProList } from "@ant-design/pro-components";
import { App, Button, Space, Tag, Typography } from "antd";
import React, { useEffect, useMemo, useState } from "react";

type AttendanceStatus = "present" | "absent" | "excused" | "late";

type Row = {
  roster_id: number;
  player_id: number;
  player_name: string;
  player_surname: string;
  attendance_id: number | null;
  status: AttendanceStatus | null;
};

type Props = {
  sessionId: number;
};

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  present: { label: "Presente", color: "green", icon: <CheckCircleOutlined /> },
  absent: { label: "Assente", color: "red", icon: <CloseCircleOutlined /> },
  excused: { label: "Giustificato", color: "gold", icon: <MailOutlined /> },
  late: { label: "In ritardo", color: "geekblue", icon: <FieldTimeOutlined /> },
};

export const TrainingSessionAttendanceList: React.FC<Props> = ({
  sessionId,
}) => {
  const { message } = App.useApp();
  const { makeRequest } = useApi();

  // se il tuo hook espone anche isLoading, puoi rimuovere questi due state locali
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<Row[]>([]);
  /**
   * localSelections contiene SOLO le scelte modificate dall’utente in questa sessione di editing.
   * Chiave = roster_id, Valore = status selezionato.
   */
  const [localSelections, setLocalSelections] = useState<
    Record<number, AttendanceStatus>
  >({});

  const fetchData = async () => {
    try {
      setLoading(true);
      // GET con querystring via "params" (il tuo makeRequest li mette sotto { params } su GET)
      const data: any = await makeRequest(
        `/api/sessions/${sessionId}/attendances`,
        "get"
      );
      setRows(data?.data);
      setLocalSelections({});
    } catch (e) {
      console.error(e);
      message.error("Errore nel caricamento presenze");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  /** status effettivo mostrato (db o override locale, se esiste) */
  const effectiveStatus = (r: Row): AttendanceStatus | null =>
    localSelections[r.roster_id] ?? r.status ?? null;

  const hasDirtyChanges = useMemo(
    () => Object.keys(localSelections).length > 0,
    [localSelections]
  );

  const setStatus = (rosterId: number, status: AttendanceStatus) => {
    setLocalSelections((prev) => ({ ...prev, [rosterId]: status }));
  };

  /** bulk helper */
  const bulkSetAll = (status: AttendanceStatus) => {
    const next: Record<number, AttendanceStatus> = {};
    for (const r of rows) next[r.roster_id] = status;
    setLocalSelections(next);
  };

  const resetLocal = () => setLocalSelections({});

  const handleSave = async () => {
    if (!hasDirtyChanges) return;
    try {
      setSaving(true);
      const payload = {
        session_id: sessionId,
        items: Object.entries(localSelections).map(([rosterId, status]) => ({
          roster_id: Number(rosterId),
          status,
        })),
      };

      // POST: il tuo makeRequest mette i dati sotto { data }
      await makeRequest(
        `/api/sessions/${sessionId}/attendances/bulk-upsert`,
        "post",
        payload
      );

      message.success("Presenze salvate");
      await fetchData(); // ricarica lo stato persistito
    } catch (e) {
      message.error("Errore nel salvataggio presenze");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProList
      rowKey={(r) => r.roster_id}
      loading={loading}
      dataSource={rows}
      metas={{
        title: {
          render: (_, r) => (
            <Space>
              <UserOutlined />
              <Typography.Text strong>
                {r.player_surname} {r.player_name}
              </Typography.Text>
              {effectiveStatus(r) && (
                <Tag color={STATUS_META[effectiveStatus(r)!].color}>
                  {STATUS_META[effectiveStatus(r)!].label}
                </Tag>
              )}
            </Space>
          ),
        },
        description: {
          render: (_, r) => (
            <Typography.Text type="secondary">
              ID {r.player_id} · Roster #{r.roster_id}
            </Typography.Text>
          ),
        },
        actions: {
          render: (_, r) => {
            const current = effectiveStatus(r);
            return (
              <Space wrap>
                {(
                  ["present", "absent", "excused", "late"] as AttendanceStatus[]
                ).map((s) => {
                  const active = current === s;
                  return (
                    <Button
                      key={s}
                      size="small"
                      type={active ? "primary" : "default"}
                      icon={STATUS_META[s].icon}
                      onClick={() => setStatus(r.roster_id, s)}
                      disabled={saving}
                    >
                      {STATUS_META[s].label}
                    </Button>
                  );
                })}
              </Space>
            );
          },
        },
      }}
      toolBarRender={() => [
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={fetchData}
          disabled={loading || saving}
        >
          Ricarica
        </Button>,
        <Button
          key="all-present"
          onClick={() => bulkSetAll("present")}
          disabled={loading || saving || rows.length === 0}
        >
          Segna tutti presenti
        </Button>,
        <Button
          key="all-absent"
          onClick={() => bulkSetAll("absent")}
          disabled={loading || saving || rows.length === 0}
        >
          Segna tutti assenti
        </Button>,
      ]}
      pagination={false}
      footer={
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Typography.Text type="secondary">
            {hasDirtyChanges
              ? `Modifiche non salvate: ${Object.keys(localSelections).length}`
              : "Nessuna modifica"}
          </Typography.Text>
          <Button onClick={resetLocal} disabled={!hasDirtyChanges || saving}>
            Annulla modifiche
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!hasDirtyChanges || saving}
            loading={saving}
          >
            Salva
          </Button>
        </Space>
      }
      split
      headerTitle="Inserisci qui le presenze"
      search={false}
    />
  );
};
