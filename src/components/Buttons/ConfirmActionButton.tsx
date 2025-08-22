import { useApi } from "@/hooks/useApi";
import { WarningOutlined } from "@ant-design/icons";
import { useToken } from "@ant-design/pro-components";
import { App, Button, ButtonProps, ModalFuncProps, message } from "antd";

export interface ConfirmActionButtonProps extends ButtonProps {
  url?: string;
  method?: "get" | "delete" | "post" | "patch" | "put";
  params?: unknown;
  onSuccess?: (item?: any) => void | Promise<any>;
  mode?: "button" | "icon";
  confirmProps?: ModalFuncProps;
  hideSuccessToast?: boolean;
}

export const ConfirmActionButton = ({
  children,
  onSuccess,
  confirmProps,
  params,
  url,
  method = "patch",
  mode = "button",
  hideSuccessToast = false,
  ...props
}: ConfirmActionButtonProps) => {
  const { makeRequest } = useApi();
  const isIconBtn = mode === "icon";
  const { modal } = App.useApp();

  const { token } = useToken();

  const showConfirm = () => {
    modal.confirm({
      type: "warning",
      icon: <WarningOutlined />,
      okText: "Conferma",
      cancelText: "Annulla",
      cancelButtonProps: {
        type: "default",
        size: "middle",
      },
      okButtonProps: {
        type: "primary",
        size: "middle",
        style: { backgroundColor: token.colorPrimary },
      },
      onOk() {
        if (url)
          return makeRequest(url, method, params)
            .then((item: any) => {
              !hideSuccessToast &&
                message.success("Operazione avvenuto con successo");

              if (onSuccess) {
                onSuccess(item);
              }
            })
            .catch((error) => {
              !hideSuccessToast &&
                message.error(error.message ?? "Qualcosa è andato storto");
            });

        if (!url && onSuccess) onSuccess();
      },
      ...confirmProps,
    } as ModalFuncProps);
  };

  return (
    <Button
      onClick={(event) => {
        event.stopPropagation();
        showConfirm();
      }}
      {...props}
    >
      {!isIconBtn && children}
    </Button>
  );
};
