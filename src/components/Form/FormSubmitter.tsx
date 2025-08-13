import { FooterToolbar, ProForm } from "@ant-design/pro-components";
import { Button } from "antd";
import { PropsWithChildren, useContext, useMemo } from "react";

interface FormSubmitterProps extends PropsWithChildren {
  type: "default" | "drawer" | "modal";
  loading: boolean;
  onBack?: () => void;
}

export const FormSubmitter = ({
  loading,
  type,
  children,
  onBack,
}: FormSubmitterProps) => {
  const modeContext = useContext(ProForm.EditOrReadOnlyContext);

  const readOnly = modeContext.mode === "read";
  const content = readOnly ? undefined : children;

  const backButton = useMemo(() => {
    if (!onBack) return null;
    return (
      <Button disabled={loading} onClick={onBack}>
        {type === "default" ? "Indietro" : "Chiudi"}
      </Button>
    );
  }, [onBack]);

  if (type === "default") {
    return <FooterToolbar extra={backButton}>{content}</FooterToolbar>;
  }

  if (type === "drawer")
    return (
      <div
        className="flex justify-between absolute bottom-0 pb-3 left-0 right-0 px-6 pt-3 border-t bg-white/60 z-50"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {backButton}
        {content}
      </div>
    );

  return (
    <div className="flex justify-between mt-4 w-full">
      {backButton}
      {content}
    </div>
  );
};
