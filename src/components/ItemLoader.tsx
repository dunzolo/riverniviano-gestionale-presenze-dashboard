import { useGetItem } from "@/hooks/useGetItem";
import { PolicyProvider } from "@/hooks/usePolicy";
import { Item } from "@/types";
import { Spin } from "antd";
import { ReactNode, createContext, useContext, useEffect } from "react";
import { ApiError } from "./ApiError";

interface ItemLoaderProps {
  url: string;
  children(item: Item, mutate: Function): ReactNode;
  onItemChange?: (item: Item) => void;
  params?: Record<any, any>;
}

/**
 * Questo componente gestisce il recupero di un singolo elemento tramite API.
 * Nel caso in cui l'API restituisca un errore, verrà mostrato un messaggio di errore.
 * In caso di successo, il contenuto verrà inserito all'interno di un provider di policy
 * in modo da trasmettere le policy ai componenti figli.
 */
export const ItemLoader = ({
  url,
  children,
  onItemChange,
  params,
}: ItemLoaderProps) => {
  const { item, isLoading, error, setParams, mutate } = useGetItem(url, params);

  useEffect(() => {
    setParams(params);
  }, [JSON.stringify(params)]);

  useEffect(() => {
    onItemChange?.(item as Item);
  }, [item]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center mt-[8.25rem]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <ApiError error={error} />;

  return (
    <PolicyProvider authorizations={{ ...item?.authorizations }}>
      <ItemLoaderContext.Provider value={{ mutate }}>
        {(() => children(item as Item, mutate))()}
      </ItemLoaderContext.Provider>
    </PolicyProvider>
  );
};

interface ContextProps {
  mutate: () => "" | Promise<void>;
}

export const ItemLoaderContext = createContext<ContextProps | undefined>(
  undefined
);

export const useItemLoaderContext = () => {
  const values = useContext(ItemLoaderContext);
  if (!values) {
    throw new Error(
      "useItemLoaderContext can only be used inside ItemLoader component"
    );
  }
  return values;
};
