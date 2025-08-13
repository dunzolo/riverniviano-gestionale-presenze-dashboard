import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type FormChanged = {
  [key: string]: () => boolean;
};

interface contextProps {
  checkFormChanged: FormChanged;
  setCheckFormChanged: Dispatch<SetStateAction<FormChanged>>;
}

const Context = createContext<contextProps | undefined>(undefined);

export const FormChangedContextProvider = ({ children }: PropsWithChildren) => {
  const [checkFormChanged, setCheckFormChanged] = useState<FormChanged>({});

  return (
    <Context.Provider value={{ checkFormChanged, setCheckFormChanged }}>
      {children}
    </Context.Provider>
  );
};

export const useFormChangedContext = () => {
  return useContext(Context);
};
