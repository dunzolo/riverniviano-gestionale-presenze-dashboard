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
}

export const FilesUploader = ({
  name,
  label,
  children,
  formItemProps,
  uploadProps,
  availableExtensions: propsAvailableExtensions,
  suggestions,
  url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/attachments`,
  storage: propsStorage,
  multiple,
  onChange,
  draggable,
  maxFileSize: propsMaxFileSize,
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

  const getCookie = (name: string) =>
    document.cookie
      .split("; ")
      .find((r) => r.startsWith(name + "="))
      ?.split("=")[1] || "";

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
    onProgress,
  }: UploadRequestOption) => {
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

    try {
      // 1) limite dimensione
      const sizeKB = ((file as RcFile).size ?? 0) / 1000;
      if (maxFileSize && sizeKB > maxFileSize) {
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

      // 2) prendi cookie CSRF di Sanctum
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      // 3) prepara FormData REALE (con filename e mime)
      const f = file as RcFile;
      const filename = f.name || "upload";
      const mime = f.type || "application/octet-stream";

      const formData = new FormData();
      const fileWithName = new File([f], filename, { type: mime });
      formData.append("attachment", fileWithName, filename);
      (availableExtensions ?? []).forEach((ext) =>
        formData.append("availableExtensions[]", ext)
      );

      // 4) POST diretto al backend Laravel
      const xsrf = decodeURIComponent(getCookie("XSRF-TOKEN"));

      const { data } = await api.post(
        `${url}/${storage}`, // es: https://backend.tld/api/attachments/private
        formData,
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": xsrf,
            "X-Requested-With": "XMLHttpRequest",
            // NON impostare "Content-Type"
          },
          // evita qualunque transform custom che magari hai impostato nella tua api
          transformRequest: [(d) => d],
          onUploadProgress: (e) => {
            if (e.total)
              onProgress?.({ percent: Math.round((e.loaded / e.total) * 100) });
          },
        }
      );

      const attachment = data.data;
      const ext = (attachment.extension ?? "").toLowerCase();
      if (!availableExtensions?.includes(ext)) {
        // @ts-ignore
        onError?.({ message: `Formato ${ext} non valido` });
        form.setFields([{ name: path, errors: [`Formato ${ext} non valido`] }]);
        return;
      }

      form.setFields([{ name: path, errors: [] }]);
      onSuccess?.("Upload successful", attachment);
    } catch (error: any) {
      const msgs = error?.response?.data?.errors?.attachment ?? [
        error?.message ?? "File non valido",
      ];
      // @ts-ignore
      onError?.({ message: msgs.join(", ") });
      form.setFields([{ name: path, errors: msgs }]);
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
