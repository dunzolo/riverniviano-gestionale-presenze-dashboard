import { fetcher } from "@/hooks/useApi";
import { Values } from "@/types";
import {
  ProForm,
  ProFormSelect,
  ProFormSelectProps,
} from "@ant-design/pro-components";
import { useMemo, useState } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { useFieldPath } from "../AdvancedProForm";

interface DfSWRConfiguration extends SWRConfiguration {
  key?: string;
}
export interface ApiSelectProps extends Omit<ProFormSelectProps, "request"> {
  url: string;
  filters?: Record<string, any>;
  hideWhenCountIsLower?: number;
  getCustomLabel?: (item: Values) => string;
  singleTags?: boolean;
  reloadWithoutSelected?: boolean;
  enableSelectWithTab?: boolean;
  /**
   * Opzioni swr
   * @see: https://swr.vercel.app/docs/api#options
   */
  swrProps?: DfSWRConfiguration;
}

interface OptionApiSelect {
  value: number | string;
  label: number | string;
  additional_info?: Values;
  [k: string]: any;
}

export const ApiSelect = ({
  url,
  filters,
  hideWhenCountIsLower,
  params,
  getCustomLabel,
  singleTags,
  reloadWithoutSelected,
  enableSelectWithTab,
  swrProps,
  ...props
}: ApiSelectProps) => {
  const form = ProForm.useFormInstance();
  const namePath = useFieldPath(props.name);

  const selected = useMemo(() => form.getFieldValue(namePath), [form]);

  const localParams = { filter: filters, per_page: -1, selected };
  const key = swrProps?.key ?? `${url}-${JSON.stringify(localParams)}`;

  // il check su namePath viene fatto per evitare la doppia chiamata nel form,
  // invece su props.name perchè nei filtri del CrudDataTable il campo non ha un nome ma deve fare comunque la chiamata
  const { data, isLoading } = useSWR(
    key,
    () => (namePath.length || !props.name) && fetcher(url, localParams),
    {
      revalidateOnFocus: false,
      onSuccess: ({ data }) => setOptions(data),
      ...swrProps,
    }
  );

  const [options, setOptions] = useState<OptionApiSelect[]>(data?.data);

  if (isLoading) {
    return <LoadingSelect {...props} />;
  }

  // mostriamo il selettore solo se esistono almeno N elementi.
  // Utile ad esempio per mostrare il selettore della lingua solo
  // se ci sono almeno due lingue a sistema
  if (hideWhenCountIsLower && data?.data.length < hideWhenCountIsLower) {
    return null;
  }

  const handleSearch = (value: string) => {
    // Se l'opzione non esiste già, aggiungila dinamicamente
    if (
      value &&
      !data?.data.find(
        (option: any) => option.label.toLowerCase() === value.toLowerCase()
      )
    ) {
      setOptions([...data?.data, { label: value, value }]);
    }
  };

  return (
    <ProFormSelect
      showSearch
      allowClear={!props.required}
      className="w-full"
      options={renderOptions(options, getCustomLabel)}
      {...props}
      fieldProps={{
        popupMatchSelectWidth: true,
        className: "w-full",
        onSearch: singleTags ? handleSearch : undefined,
        onKeyDown: (e) => {
          if (enableSelectWithTab && e.code === "Tab") {
            const selectedOption = options.at(-1);
            form.setFieldValue(namePath, selectedOption?.value);
          }
        },
        ...props.fieldProps,
      }}
    />
  );
};

export const renderOptions = (
  data: OptionApiSelect[],
  getCustomLabel?: (item: Values) => string
) => {
  if (!data) return [];

  return data.map((item: OptionApiSelect) => ({
    ...item,
    label: getCustomLabel ? getCustomLabel(item) : item.label,
  }));
};

export const LoadingSelect = (props: ProFormSelectProps) => (
  <ProFormSelect
    {...props}
    // remove name for prevent show value during loading state
    name={undefined}
    placeholder="Caricamento..."
    fieldProps={{
      loading: true,
      notFoundContent: null,
    }}
  />
);

export const ApiSelectForFilters = ({
  name,
  mode,
  fieldProps,
  ...props
}: ApiSelectProps) => {
  const form = ProForm.useFormInstance();

  return (
    <ApiSelect
      {...props}
      mode={mode}
      fieldProps={{
        ...fieldProps,
        onChange: (value, option) => {
          fieldProps?.onChange && fieldProps.onChange(value, option);
          if (mode === "multiple" && !value?.length) {
            form.setFieldValue(name, null);
          }
        },
      }}
    />
  );
};
