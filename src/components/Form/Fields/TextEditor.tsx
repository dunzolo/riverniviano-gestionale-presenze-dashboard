import { HtmlPreview } from "@/components/Descriptions/HtmlPreview";
import { ProForm } from "@ant-design/pro-components";
import { Editor } from "@tinymce/tinymce-react";
import { IProps } from "@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor";
import { Form } from "antd";
import { NamePath } from "antd/es/form/interface";
import clsx from "clsx";
import { useContext, useState } from "react";
import { AdvancedProForm } from "../AdvancedProForm";

interface TextEditorProps {
  name: NamePath;
  className?: string;
  value?: string;
  label?: string;
  required?: boolean;
  variables?: string[];
  init?: Pick<IProps, "init">;
  height?: number;
}

export const TextEditor = ({ ...props }: TextEditorProps) => {
  return (
    <AdvancedProForm.Item
      {...props}
      className={clsx("w-full", props.className)}
    >
      <TextEditorContent {...props} />
    </AdvancedProForm.Item>
  );
};

const TextEditorContent = ({
  name,
  value,
  variables,
  init,
  height,
}: TextEditorProps) => {
  const modeContext = useContext(ProForm.EditOrReadOnlyContext);
  const form = Form.useFormInstance();

  const [text, setText] = useState<string | undefined>(value);

  const renderVariables = (
    <div className="flex gap-2 p-2">
      {variables?.map((v: string) => {
        const variable = `{{ ${v} }}`;
        const inserted = text?.includes(variable);

        return (
          <div
            className={clsx(
              "text-[10px] px-2 py-1 rounded select-all",
              inserted ? "bg-green-300 text-green-800" : "bg-gray-200"
            )}
            key={variable}
          >
            {variable}
          </div>
        );
      })}
    </div>
  );

  if (modeContext.mode === "read") {
    return <HtmlPreview>{text}</HtmlPreview>;
  }

  return (
    <>
      <div className="w-full bg-white divide-y">
        <Editor
          value={text}
          onEditorChange={(insertValue: string) => {
            setText(insertValue);
            form.setFieldValue(name, insertValue);
          }}
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          init={{
            branding: false,
            statusbar: false,
            plugins: "autolink link lists",
            toolbar:
              "bold italic underline strikethrough | forecolor backcolor | numlist bullist | fontsize fontselect",
            menubar: false,
            font_size_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
            height: height ?? 200,
            min_height: height ?? 200,
            max_height: 700,
            toolbar_mode: "wrap",
            skin: "oxide",
            content_css: "default",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:16px;}",
            ...init,
          }}
        />
        {variables && renderVariables}
      </div>
    </>
  );
};
