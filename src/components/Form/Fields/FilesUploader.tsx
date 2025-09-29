import { api } from "@/hooks/useApi";
import { useFormLoading } from "@/hooks/useFormLoading";
import { useOptions } from "@/hooks/useOptions";
import { Item, Values } from "@/types";
import { InboxOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { ProForm } from "@ant-design/pro-components";
import { Button, FormItemProps, Upload, UploadProps } from "antd";
import { RcFile } from "antd/es/upload";
import { FormInstance } from "antd/lib";
import { UploadRequestOption } from "rc-upload/lib/interface";
import React, { useContext } from "react";
import { AdvancedProForm, useFieldPath } from "../AdvancedProForm";

export interface FilesUploaderProps {
  name: string | (string | number)[];
  label?: string;
  children?: React.ReactNode;
  suggestions?: string[];
  formItemProps?: FormItemProps;
  uploadProps?: UploadProps;
  availableExtensions?: string[];
  url?: string;
  storage?: string;
  multiple?: boolean;
  onChange?: (form: FormInstance<any>, files: Values[]) => void;
  draggable?: boolean;
  /** In KB */
  maxFileSize?: number;
  uploadChunk?: boolean;
  /** In KB */
  chunkSize?: number;
}

export const FilesUploader = ({
  name,
  label,
  children,
  formItemProps,
  uploadProps,
  availableExtensions: propsAvailableExtensions,
  suggestions,
  url = "/api/attachments",
  storage: propsStorage,
  multiple,
  onChange,
  draggable,
  maxFileSize: propsMaxFileSize,
  uploadChunk,
  chunkSize = 25 * 1024,
}: FilesUploaderProps) => {
  const {
    availableExtensions: defaultAvailableExtensions,
    maxFileSize: defaultMaxFileSize,
    defaultStorage,
  } = useOptions();
  const modeContext = useContext(ProForm.EditOrReadOnlyContext);
  const readonly = modeContext.mode === "read";
  const form = ProForm.useFormInstance();
  const path = useFieldPath(name);
  const { isFormLoading, setIsFormLoading } = useFormLoading();

  const maxFileSize = propsMaxFileSize ?? defaultMaxFileSize;
  const storage = propsStorage ?? defaultStorage ?? "private";
  const availableExtensions =
    propsAvailableExtensions ?? defaultAvailableExtensions;

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
    onProgress,
  }: UploadRequestOption) => {
    const fileSizeInBytes = (file as RcFile)?.size;
    const fileSize = fileSizeInBytes / 1000;

    if (maxFileSize && fileSize > maxFileSize) {
      // @ts-ignore
      onError?.({ message: "File troppo grande" });
      form.setFields([
        {
          name: path,
          errors: [`File troppo grande, massimo ${maxFileSize / 1024} MB`],
        },
      ]);
      return;
    }

    const afterUpload = (attachment: any) => {
      if (!availableExtensions?.includes(attachment.extension?.toLowerCase())) {
        // @ts-ignore
        onError?.({
          message: `Formato ${attachment.extension} non valido`,
        });
        form.setFields([
          {
            name: path,
            errors: [`Formato ${attachment.extension} non valido`],
          },
        ]);
      } else {
        form.setFields([{ name: path, errors: [] }]);
        onSuccess?.("Upload successful", attachment);
      }
    };

    const handleErrorFetch = (error: Values) => {
      const errorMessages = error.response?.data.errors?.attachment ?? [
        error.message,
      ];
      // @ts-ignore
      onError?.({ message: errorMessages?.join(", ") ?? "File non valido" });
      form.setFields([
        {
          name: path,
          errors: errorMessages ?? ["File non valido"],
        },
      ]);
    };

    // 👉 invio semplice senza chunk
    try {
      const formData = new FormData();
      formData.append("attachment", file as RcFile);

      // ⚠️ NON impostare Content-Type a mano: lasciarlo a FormData (imposta lui boundary)
      const { data } = await api.post(
        // usa la tua rotta API *riscritta* (resta identica a prima)
        `${url}/${storage}`, // es. "/api/attachments/public"
        formData,
        {
          onUploadProgress: (event) => {
            if (event.total)
              onProgress?.({
                percent: Math.round((event.loaded / event.total) * 100),
              });
          },
        }
      );

      afterUpload(data.data);
    } catch (error: any) {
      handleErrorFetch(error);
    }
  };

  const extensionString = availableExtensions
    ?.map((extension: string) => `.${extension}`)
    .join(", ");

  const maxCount = uploadProps?.maxCount ?? (multiple ? undefined : 1);

  const getChildren = () => {
    if (readonly) return null;
    if (children) return children;
    //if (maxCount && selfWatch?.length === maxCount) return null;
    if (draggable)
      return (
        <>
          <InboxOutlined className="text-4xl text-primary-500" />
          <div className="text-gray-500 !text-xs flex flex-col p-3">
            <div>Clicca o trascina e rilascia qui un file.</div>
            <div>
              <div>Formati accettati: {extensionString}</div>
              {!!maxFileSize && (
                <div>Dimensione massima: {maxFileSize / 1024} MB</div>
              )}
            </div>
            {suggestions?.map((s, index) => {
              return <div key={index}>{s}</div>;
            })}
          </div>
        </>
      );

    if (
      uploadProps?.listType &&
      ["picture-card", "picture-circle"].includes(uploadProps?.listType)
    )
      return (
        <div className="flex flex-col gap-1.5 justify-center items-center">
          <PlusOutlined />
          Carica
        </div>
      );

    return <Button icon={<UploadOutlined />}>Carica</Button>;
  };

  const Uploader = draggable && !readonly ? Upload.Dragger : Upload;

  const uploadDragger = (
    <Uploader
      className="space-y-2"
      disabled={readonly}
      accept={availableExtensions ? extensionString : undefined}
      listType="text"
      multiple={multiple}
      maxCount={maxCount}
      customRequest={handleUpload}
      defaultFileList={
        form?.getFieldValue(path)?.map((item: Item) => ({
          ...item,
          thumbUrl: item.preview_path,
          file_extension: item.type,
        })) ?? []
      }
      onChange={({ file, fileList }) => {
        const files = fileList.map(
          ({ xhr, ...file }) => !file.error && { ...file, ...xhr }
        );

        if (fileList && fileList.length && setIsFormLoading) {
          const someUploadingStatus = fileList?.some(
            (x) => x.status === "uploading"
          );
          const everyNotUploadingStatus = fileList?.every(
            (x) => x.status !== "uploading"
          );
          if (someUploadingStatus) {
            !isFormLoading && setIsFormLoading(true);
          } else if (everyNotUploadingStatus) {
            isFormLoading && setIsFormLoading(false);
          }
        }

        if (onChange) {
          onChange(form, files);
        } else {
          form.setFieldValue(path, files);
        }
      }}
      {...uploadProps}
    >
      {getChildren()}
    </Uploader>
  );

  return (
    <AdvancedProForm.Item
      shouldUpdate
      // Using name instead of path since if the DfProForm.Item is used inside ProList it will be placed right inside the form values following the hierarchy
      name={name}
      valuePropName="fileList"
      className="[&_.ant-upload-list-item-done]:!m-0"
      getValueFromEvent={normFile}
      tooltip={
        !draggable && (
          <div>
            <div>Formati accettati: {extensionString}</div>
            {!!maxFileSize && (
              <div>Dimensione massima: {maxFileSize / 1024} MB</div>
            )}
          </div>
        )
      }
      {...formItemProps}
      label={label}
    >
      {uploadDragger}
    </AdvancedProForm.Item>
  );
};
