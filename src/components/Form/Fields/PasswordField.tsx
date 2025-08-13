import { useApi } from "@/hooks/useApi";
import { CheckOutlined, CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  ProForm,
  ProFormItemProps,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Tooltip } from "antd";
import { useState } from "react";
import { useCopyToClipboard } from "react-use";

export const PasswordField = (props: ProFormItemProps) => {
  const form = ProForm.useFormInstance();
  const { makeRequest } = useApi();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleGeneretaNewPassword = () => {
    makeRequest("/password/generate").then(({ data }) => {
      form.setFieldValue("password", data.password);
    });
  };

  const password = ProForm.useWatch(props.name, form);

  const handleOnCopy = () => {
    if (password && !isCopied) {
      copyToClipboard(password);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <div>
      <div className="flex w-full">
        <ProFormText.Password
          placeholder={"Digita"}
          formItemProps={{ className: "grow" }}
          fieldProps={{ autoComplete: "off" }}
          {...props}
        />
        <div className="flex items-start pl-1 pt-[1.57rem]">
          <Tooltip title={"Copia password"}>
            <Button
              icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleOnCopy}
              type="text"
              disabled={!password}
            />
          </Tooltip>
          <Tooltip title={"Genera password"}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleGeneretaNewPassword}
              type="text"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
