import { Values } from "@/types";
import { ProFormInstance } from "@ant-design/pro-components";
import { Button } from "antd";
import { ReactNode, RefObject, useRef, useState } from "react";
import { Section } from "../Section";
import { AdvancedProForm, FormProps, setErrors } from "./AdvancedProForm";

interface AuthForm extends FormProps {
  footer?: ReactNode;
  submitLabel?: string;
}

export const AuthForm = ({
  onFinish,
  onSuccess,
  children,
  footer,
  submitLabel,
  ...props
}: AuthForm) => {
  const ref = useRef<any>(undefined) as RefObject<ProFormInstance>;
  const formRef = props.formRef ?? ref;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Values) => {
    try {
      const response = onFinish && (await onFinish(values));
      onSuccess && (await onSuccess());
      return response;
    } catch ({ response }: any) {
      const errors = response?.data?.errors;

      if (errors) setErrors(formRef, errors);

      setLoading(false);
      return Promise.reject(errors);
    }
  };

  return (
    <AdvancedProForm
      submitter={false}
      onFinish={handleSubmit}
      onLoadingChange={setLoading}
      {...props}
      formRef={formRef}
      readonly={false}
    >
      <Section.Grid>
        {children}
        <Button loading={loading} type="primary" htmlType="submit">
          {submitLabel ?? "Invia"}
        </Button>
        {footer && <Section.Grid>{footer}</Section.Grid>}
      </Section.Grid>
    </AdvancedProForm>
  );
};
