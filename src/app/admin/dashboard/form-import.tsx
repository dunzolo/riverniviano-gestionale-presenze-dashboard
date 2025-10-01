"use client";

import { AdvancedProForm } from "@/components/Form/AdvancedProForm";
import { ApiSelect } from "@/components/Form/Fields/ApiSelect";
import { FilesUploader } from "@/components/Form/Fields/FilesUploader";
import { Section } from "@/components/Section";
import { useApi } from "@/hooks/useApi";
import { Values } from "@/types";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import {
  ActionType,
  ProForm,
  ProList,
  useToken,
} from "@ant-design/pro-components";
import { Button, Flex, List, message, Typography } from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";

const { Text } = Typography;

export const FormImport = () => {
  const { makeRequest } = useApi();
  const { token } = useToken();

  const [form] = ProForm.useForm();
  const [uploaderKey, setUploaderKey] = useState(0);

  const listRef = useRef<ActionType>();

  const hardReset = () => {
    form.resetFields();
    form.setFieldsValue({ attachment: [] });
    setUploaderKey((k) => k + 1); // forza il remount dell’Upload se serve
  };

  return (
    <Section.Grid className="md:grid-cols-2">
      <Section.Card title="Import atleti da Excel">
        <AdvancedProForm
          form={form}
          url="/api/players/import"
          submitter={{
            render(props) {
              return (
                <div className="w-full flex justify-end mt-4 gap-2">
                  <Button onClick={hardReset}>Azzera</Button>

                  <Button
                    type="primary"
                    onClick={() => {
                      props?.submit?.();
                    }}
                  >
                    Importa
                  </Button>
                </div>
              );
            },
          }}
          readonly={false}
          onSuccess={() => {
            hardReset();
            listRef.current?.reload();
          }}
        >
          <Section.Grid>
            <ApiSelect
              url="/api/seasons/all"
              name="season_id"
              label="Stagione"
              required
            />
            <FilesUploader
              draggable
              key={uploaderKey}
              name="attachment"
              label="Carica file (Excel/CSV)"
              availableExtensions={["xlsx", "xls", "csv"]}
              maxFileSize={10 * 1024}
            />
          </Section.Grid>
        </AdvancedProForm>
      </Section.Card>

      <Section.Card title="Storico file caricati">
        <ProList
          actionRef={listRef}
          rowKey="id"
          request={async () => {
            try {
              const response = await makeRequest("/api/attachments", "get");
              return {
                data: response?.data,
                total: response?.meta?.total,
                success: true,
              };
            } catch {
              message.error("Errore nel caricamento dati");
              return { data: [], success: false };
            }
          }}
          renderItem={(item: Values) => {
            return (
              <List.Item
                className="!py-2"
                actions={[
                  <Flex key="meta" gap={16} wrap>
                    <Text type="secondary">
                      {`Caricato il ${dayjs(item.created_at).format(
                        "DD/MM/YYYY HH:mm"
                      )}`}
                    </Text>
                    <Text type="secondary">
                      {item.size
                        ? `${(item.size / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                    </Text>
                  </Flex>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <Flex gap={16} wrap>
                      <Flex gap={2}>
                        <CalendarOutlined className="text-base min-w-[20px] w-[20px] h-[20px] justify-center" />
                        {item.season_name}
                      </Flex>
                      <Flex gap={2}>
                        <UserOutlined
                          className="text-base min-w-[20px] w-[20px] h-[20px] justify-center"
                          style={{
                            color: "white",
                            backgroundColor: token.colorPrimary,
                            borderRadius: "50%",
                          }}
                        />
                        {item.uploaded_by}
                      </Flex>
                    </Flex>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Section.Card>
    </Section.Grid>
  );
};
