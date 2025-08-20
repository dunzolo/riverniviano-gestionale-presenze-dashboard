import dayjs from "@/lib/dayjs";
import { Values } from "@/types";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { ProFieldFCRenderProps, useToken } from "@ant-design/pro-components";

const DescriptionBoolean = (bool: any) => {
  const { token } = useToken();
  if (bool) return <CheckCircleFilled style={{ color: token.colorSuccess }} />;
  return <CloseCircleFilled style={{ color: token.colorError }} />;
};

const DescriptionReverseBoolean = (bool: any) => {
  const { token } = useToken();
  if (bool) return <CloseCircleFilled style={{ color: token.colorError }} />;
  return <CheckCircleFilled style={{ color: token.colorSuccess }} />;
};

const DescriptionPluck = (
  items: Values[],
  fieldProps: ProFieldFCRenderProps
) => {
  const key = fieldProps.fieldProps?.keyName ?? "name";
  const renderItem =
    fieldProps.fieldProps.renderItem ?? ((value: any) => value);

  return <>{items.map((item) => renderItem(item[key])).join(", ")}</>;
};

const DescriptionDate = (value: any) => {
  return value ? <>{dayjs(value).format("L")}</> : <>-</>;
};

const AdvancedDescription = {
  Boolean: DescriptionBoolean,
  ReverseBoolean: DescriptionReverseBoolean,
  Pluck: DescriptionPluck,
  Date: DescriptionDate,
};

export { AdvancedDescription };
