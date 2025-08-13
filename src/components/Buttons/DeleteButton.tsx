import { useApi } from "@/hooks/useApi";
import { usePolicy } from "@/hooks/usePolicy";
import { Item, Values } from "@/types";
import { DeleteOutlined } from "@ant-design/icons";
import {
  ProFormInstance,
  ProFormText,
  useToken,
} from "@ant-design/pro-components";
import { App, Button, ButtonProps, List, ModalFuncProps, Tooltip } from "antd";
import { RefObject, useMemo, useRef } from "react";
import { AdvancedProForm } from "../Form/AdvancedProForm";

export interface DeleteButtonProps extends Omit<ButtonProps, "variant"> {
  url: string;
  item?: Item;
  onSuccess?: () => void | Promise<any>;
  modalProps?: ModalFuncProps;
  confirmText?: string | ((item: Item) => string);
  confirmMessage?: string | ((item: Item) => string);
  variant?: "button" | "icon";
  tooltip?: string;
  params?: Values;
}

export const DeleteButton = ({
  url,
  item,
  children,
  onSuccess,
  modalProps,
  confirmText,
  confirmMessage,
  variant = "button",
  tooltip,
  params,
  ...props
}: DeleteButtonProps) => {
  const { makeRequest } = useApi();
  const { token } = useToken();
  const { modal, message } = App.useApp();
  const { authorizations } = usePolicy();

  const isIconBtn = variant === "icon";

  const formRef = useRef<any>(undefined) as RefObject<ProFormInstance>;

  const textForConfirmation = useMemo(() => {
    if (typeof confirmText === "function" && item) return confirmText(item);
    if (typeof confirmText === "string") return confirmText;
    return undefined;
  }, [confirmText]);

  const messageForConfirmation = useMemo(() => {
    if (typeof confirmMessage === "function" && item)
      return confirmMessage(item);
    if (typeof confirmMessage === "string") return confirmMessage;
    return undefined;
  }, [confirmMessage]);

  const showDeleteConfirm = () => {
    modal.confirm({
      title: "Elimina",
      type: "error",
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      content: (
        <>
          {textForConfirmation ? (
            <AdvancedProForm
              submitter={false}
              formRef={formRef}
              readonly={!authorizations.delete}
            >
              <div className="pb-1">
                {messageForConfirmation ??
                  'Per confermare la cancellazione digitare "{{textForConfirmation}}".'}
              </div>
              <ProFormText name="validation" />
            </AdvancedProForm>
          ) : (
            "Sei sicuro di voler procedere?"
          )}
        </>
      ),
      okText: "Elimina",
      cancelButtonProps: {
        type: "default",
      },
      okButtonProps: {
        type: "primary",
        danger: true,
      },
      onOk() {
        if (
          textForConfirmation &&
          formRef.current?.getFieldValue("validation") !== textForConfirmation
        ) {
          formRef.current?.setFields([
            { name: "validation", errors: ["Nome non corrispondente."] },
          ]);
          return Promise.reject();
        }

        return makeRequest(url, "delete", params)
          .then(() => {
            message.success("Eliminazione avvenuta con successo!");

            if (onSuccess) onSuccess();
          })
          .catch((e) => {
            modal.error({
              title: "Errore",
              okType: "danger",
              content: (
                <List
                  dataSource={e}
                  renderItem={(item: string) => <div>{item}</div>}
                />
              ),
            });
          });
      },
      ...modalProps,
    } as ModalFuncProps);
  };

  const tooltipText = tooltip ?? "Elimina";

  if (authorizations.delete)
    return (
      <Tooltip title={isIconBtn ? tooltipText : ""}>
        <Button
          type="text"
          danger
          onClick={(event) => {
            event.stopPropagation();
            showDeleteConfirm();
          }}
          icon={isIconBtn && <DeleteOutlined />}
          {...props}
        >
          {!isIconBtn && (children ?? "Elimina")}
        </Button>
      </Tooltip>
    );

  return null;
};
