"use client";

import { AttendanceStatusButtons } from "@/app/admin/sessions/(components)/AttendanceStatusButton";
import {
  CrudDataTableFooter,
  useCrudDataTable,
} from "@/components/CrudDataTable";
import { AdvancedProForm, FormProps } from "@/components/Form/AdvancedProForm";
import { NumberInput } from "@/components/Form/Fields/NumberInput";
import { ItemLoader } from "@/components/ItemLoader";
import { Section } from "@/components/Section";
import { AttendanceStatus, SessionType } from "@/utils/enum";
import { TrophyOutlined, UserOutlined } from "@ant-design/icons";
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormList,
} from "@ant-design/pro-components";
import { Typography } from "antd";
import dayjs from "dayjs";

export const AttendanceForm = ({ ...props }: FormProps) => {
  const { item } = useCrudDataTable();

  const url = `/api/sessions/${item?.id}/attendances`;

  return (
    <>
      <Typography.Title level={4} className="!mb-0">
        <div className="flex flex-col items-center">
          <div>
            {item?.type === SessionType.Training ? (
              <>{item.training?.title}</>
            ) : (
              <TrophyOutlined />
            )}
          </div>
          <div className="text-sm font-light text-gray-500">
            {dayjs(item?.date).format("dddd D MMMM YYYY")}
          </div>
        </div>
      </Typography.Title>

      <ItemLoader url={url}>
        {(item, mutate) => {
          return (
            <AdvancedProForm
              {...props}
              url={`${url}/bulk-update`}
              initialValues={{
                attendances: item,
              }}
              submitter={{
                resetButtonProps: {
                  style: { display: "none" },
                },
                searchConfig: {
                  submitText: "Salva",
                },
                render(props, dom) {
                  return <CrudDataTableFooter>{dom}</CrudDataTableFooter>;
                },
              }}
            >
              <ProFormList
                name="attendances"
                creatorButtonProps={false}
                deleteIconProps={false}
                className="[&_.ant-pro-card-title]:!w-full "
                itemRender={({ listDom }, { index }) => {
                  const row = item[index];
                  return (
                    <Section.Card
                      key={row?.id ?? index}
                      headStyle={{
                        paddingInline: "16px",
                      }}
                      bodyStyle={{
                        padding: 0,
                      }}
                      className="!mb-2"
                      title={
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <UserOutlined
                              className="text-base min-w-[24px] w-[24px] h-[24px] justify-center"
                              style={{
                                color: "white",
                                backgroundColor: "#1677ff",
                                borderRadius: "50%",
                              }}
                            />
                            <Typography.Text className="!text-sm">
                              {row?.player?.full_name}
                            </Typography.Text>
                          </div>

                          <ProForm.Item name="status" noStyle>
                            <AttendanceStatusButtons size="small" />
                          </ProForm.Item>
                        </div>
                      }
                    >
                      <Section.Grid>{listDom}</Section.Grid>
                    </Section.Card>
                  );
                }}
              >
                <>
                  {/* ID nascosto, resta nell'item */}
                  <ProForm.Item name="id" hidden>
                    <input />
                  </ProForm.Item>

                  {/* Mostra i campi extra SOLO se status === Present */}
                  <ProFormDependency name={["status"]}>
                    {({ status }) =>
                      status === AttendanceStatus.Present && (
                        <div className="!grid md:!grid-cols-2 xl:!grid-cols-4 !gap-2 !p-4 !items-center">
                          <div className="!flex !items-center gap-2">
                            <NumberInput
                              name="minutes_played"
                              prefix="🕛 Minuti giocati"
                              className="w-full"
                              fieldProps={{
                                min: 0,
                              }}
                            />
                          </div>
                          <div className="!flex !items-center gap-2">
                            <NumberInput
                              name="goals"
                              prefix="⚽ Goal"
                              className="w-full"
                              fieldProps={{
                                min: 0,
                              }}
                            />
                          </div>
                          <div className="!flex !items-center gap-2">
                            <NumberInput
                              name="assists"
                              prefix="👟 Assist"
                              className="w-full"
                              fieldProps={{
                                min: 0,
                              }}
                            />
                          </div>

                          <div className="!flex !gap-4">
                            <ProFormCheckbox name="yellow_card">
                              🟨 Ammonito
                            </ProFormCheckbox>
                            <ProFormCheckbox name="red_card">
                              🟥 Espulso
                            </ProFormCheckbox>
                          </div>
                        </div>
                      )
                    }
                  </ProFormDependency>
                </>
              </ProFormList>
            </AdvancedProForm>
          );
        }}
      </ItemLoader>
    </>
  );
};
