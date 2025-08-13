import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useToken } from "@ant-design/pro-components";

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

const AdvancedDescription = {
  Boolean: DescriptionBoolean,
  ReverseBoolean: DescriptionReverseBoolean,
};

export { AdvancedDescription };
