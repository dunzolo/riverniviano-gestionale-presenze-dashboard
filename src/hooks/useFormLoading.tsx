import * as React from "react";
import { PropsWithChildren, useState } from "react";

interface FormLoadingContextProps {
  isFormLoading: boolean;
  setIsFormLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormLoadingContext = React.createContext<
  FormLoadingContextProps | undefined
>(undefined);

export const FormLoadingProvider = ({ children }: PropsWithChildren) => {
  const [isFormLoading, setIsFormLoading] = useState(false);

  return (
    <FormLoadingContext.Provider value={{ isFormLoading, setIsFormLoading }}>
      {children}
    </FormLoadingContext.Provider>
  );
};

export const useFormLoading = () =>
  React.useContext(FormLoadingContext) as FormLoadingContextProps;
