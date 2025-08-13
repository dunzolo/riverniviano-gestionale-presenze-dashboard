import { Result, ResultProps } from "antd";
import { AxiosError } from "axios";
import { Section } from "./Section";

interface ApiErrorProps extends ResultProps {
  error?: AxiosError<any>;
}

export const ApiError = ({ error, ...props }: ApiErrorProps) => {
  return (
    <Section.Card>
      <Result
        status="warning"
        title={`Errore ${error?.response?.status}`}
        subTitle={
          error?.response?.data?.message ??
          "Non siamo riusciti a caricare i dati richiesti. Contatta un amministartore di sistema."
        }
        {...props}
      />
    </Section.Card>
  );
};
