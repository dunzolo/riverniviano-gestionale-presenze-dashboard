"use client";

import { useApi } from "@/hooks/useApi";
import { PolicyProvider } from "@/hooks/usePolicy";
import { Item, Values } from "@/types";
import { extractRecursiveKeys, formatValues } from "@/utils/util";
import {
  ActionType,
  ProTable as AntdProTable,
  BaseQueryFilterProps,
  ColumnsState,
  ProColumnType,
  ProColumns,
  ProTableProps,
  useToken,
} from "@ant-design/pro-components";
import { Button, FormInstance } from "antd";
import { SortOrder } from "antd/lib/table/interface";
import {
  ChangeEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDebounce } from "react-use";
import { ApiError } from "./ApiError";
import { DeleteButtonProps } from "./Buttons/DeleteButton";
import { DetailButtonProps } from "./Buttons/DetailButton";
import { ToggleFilterButton } from "./Buttons/ToggleFilterButton";
import { Section } from "./Section";

interface ObjectDeleteButtonProps extends Omit<DeleteButtonProps, "url"> {
  url?: string;
}

export interface CustomColumn extends Omit<ProColumnType<any, any>, "search"> {
  hideAsDefault?: boolean;
  detail?: boolean;
  search?: boolean;
  name?: string | string[];
}

export interface DataTableProps
  extends Omit<ProTableProps<any, any>, "columns"> {
  id?: string;
  url?: string;
  actionBaseUrl?: string;
  noAction?: boolean;
  actionColumnProps?: ProColumns;
  deleteButtonProps?: ObjectDeleteButtonProps;
  detailButtonProps?: DetailButtonProps;
  columns?: CustomColumn[];
  defaultFilters?: Values;
  defaultSearch?: string;
  additionalActions?(item: Item): ReactNode;
  renderDeleteButton?(item: Item): React.ReactNode;
  renderDetailButton?(item: Item): React.ReactNode;
}

type Params = Values;

export const DataTable = ({
  url,
  id,
  toolbar,
  actionBaseUrl,
  noAction = false,
  actionColumnProps,
  deleteButtonProps,
  detailButtonProps,
  defaultFilters,
  defaultSearch,
  additionalActions,
  renderDeleteButton,
  renderDetailButton,
  onChange,
  children,
  ...props
}: DataTableProps) => {
  const { makeRequest, error } = useApi();
  const [search, setSearch] = useState<string>(defaultSearch ?? "");
  const [open, setOpen] = useState(false);
  const [filterCount, setFilterCount] = useState<number>(0);
  const [authorizations, setAuthorizations] = useState({});
  const [currentSort, setCurrentSort] = useState<any>();
  const [currentPage, setCurrentPage] = useState<number | undefined>(1);

  const defaultActionRef = useRef<ActionType>(undefined);
  const actionRef =
    (props.actionRef as RefObject<ActionType | undefined>) ?? defaultActionRef;

  // @ts-ignore
  useDebounce(
    () => {
      setCurrentPage(1);
      actionRef?.current?.reload();
    },
    400,
    [search]
  );

  const localFormRef = useRef<any>(undefined) as RefObject<FormInstance>;
  const formRef = props.formRef ?? localFormRef;

  const persistenceKey = id ?? url;

  const { token } = useToken();

  const convertSortForLaravel = (sort: Record<string, SortOrder>) => {
    if (typeof sort == "undefined") return {};

    return Object.keys(sort).map((key) => {
      const localKey = key.replace(",", ".");
      if (sort[key] === "descend") return `-${localKey}`;
      return localKey;
    });
  };

  const handleSearch = (term: string) => {
    setCurrentPage(1);
    setSearch(term);
  };

  const handleRequest = async (
    url: string,
    search: string | undefined,
    params: Params,
    sort: Record<string, SortOrder>
  ) => {
    const { current, pageSize, ...rest } = params;
    const filters = convertFiltersForLaravel(rest);

    const count = Object.values(filters)
      .filter((element) => typeof element !== "undefined" && element !== "")
      .filter((val) => val).length;

    const paramsCount = props.params
      ? Object.values(props.params)
          .filter((element) => typeof element !== "undefined" && element !== "")
          .filter((val) => val).length
      : 0;

    setFilterCount(count - paramsCount);

    const newSort = convertSortForLaravel(sort);
    setCurrentSort(newSort);

    const requestParams = {
      filter: filters,
      page: currentPage,
      search,
      per_page: pageSize,
      sort: newSort,
    };

    return makeRequest(url, "get", requestParams).then(
      ({ data, meta: pagination, authorizations }) => {
        setAuthorizations(authorizations);
        return {
          data,
          total: pagination?.total,
        };
      }
    );
  };

  const hasNoFilter =
    props?.columns?.filter((col) => col.hideInSearch || !col?.search).length ===
      props?.columns?.length || props.search === false;

  const renderFilterButton = (
    <ToggleFilterButton
      count={filterCount}
      open={open}
      className="pl-3 pr-1"
      onClick={() => setOpen(!open)}
    />
  );

  const actions = [
    ...(toolbar?.actions ?? []),
    !hasNoFilter && renderFilterButton,
  ].filter(Boolean);

  const columnsRender = (): any => {
    // di default antd imposta le colonne con search a true
    // noi le impostiamo di default a false
    const columns = props?.columns?.map(({ search, ...column }) => {
      if (!search) {
        return { search: false, ...column };
      }
      return column;
    });

    const defaultActions: ProColumns = {
      hideInSetting: true,
      dataIndex: "",
      fixed: "right",
      align: "right",
      sorter: false,
      search: false,
      width: 65,
      render: (node, item) => (
        <PolicyProvider authorizations={item.authorizations}>
          {additionalActions && additionalActions(item)}
          {renderDeleteButton && renderDeleteButton(item)}
          {renderDetailButton && renderDetailButton(item)}
        </PolicyProvider>
      ),
      ...actionColumnProps,
    };

    if (!noAction) {
      columns?.push(defaultActions);
    }

    return columns;
  };

  const setFilters = (filters: Values) => {
    for (const paramKey in filters) {
      if (filters[paramKey]) {
        formRef.current?.setFieldValue(paramKey, filters[paramKey]);
      }
    }
  };

  useEffect(() => {
    setFilters(defaultFilters ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRowClassName = (record: Values) => {
    return "bg-white"; // No additional class for other rows
  };

  const convertArrayToObject = (
    columns: Values[]
  ): Record<string, ColumnsState> | undefined => {
    const finalObj = columns?.reduce((obj, item) => {
      if (item.dataIndex)
        obj[item.dataIndex] = { show: item?.hideAsDefault ? false : true };
      return obj;
    }, {});

    if (finalObj) return finalObj;
  };

  const commonProps: Values = {
    showSorterTooltip: false,
    rowClassName: getRowClassName,
    cardBordered: true,
    actionRef: actionRef,
    formRef: formRef,
    className: "responsive-table",
    options: { density: false },
    onReset() {
      defaultFilters && setFilters(defaultFilters);
      handleSearch("");
    },
    search: {
      layout: "vertical",
      defaultCollapsed: false,
      collapseRender: false,
      optionRender: (
        searchConfig: Omit<BaseQueryFilterProps, "submitter" | "isForm">,
        props: Omit<BaseQueryFilterProps, "searchConfig">,
        dom: ReactNode[]
      ) => {
        dom.unshift(
          <Button key="close" type="text" onClick={() => setOpen(!open)}>
            Chiudi
          </Button>
        );
        return dom;
      },
      className: hasNoFilter || !open ? "!hidden" : "",
      submitterColSpanProps: { span: 8 },
    },
    toolbar: {
      search: {
        onSearch: handleSearch,
        value: search,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          setSearch(e.currentTarget.value);
        },
      },
      ...toolbar,
      actions,
    },
    rowKey: "id",
    scroll: { x: "max-content" },
    tableLayout: "auto",

    columnsState: {
      persistenceKey: persistenceKey,
      persistenceType: "localStorage",
      defaultValue: convertArrayToObject(props.columns ?? []),
    },
    ...props,
    columns: columnsRender(),
    // Se si verificano errori lato API, sostituiamo la tabella con la sezione degli errori.
    // Altrimenti, mettiamo undefined per lasciare il dato di default.
    // Utilizziamo 'components' invece di sostituire tutto, in modo che nel caso di errori sui filtri possiamo toglierli.
    components: error
      ? { table: () => <ApiError error={error} /> }
      : props.components,
    form: {
      initialValues: defaultFilters,
    },
    manualRequest: true,
  };

  return (
    <PolicyProvider authorizations={authorizations}>
      <Section.Grid>
        <AntdProTable
          pagination={{
            showSizeChanger: true,
            current: currentPage,
          }}
          size="small"
          onChange={(pagination, filter, sorter, extra) => {
            setCurrentPage(pagination.current);
            onChange?.(pagination, filter, sorter, extra);
          }}
          onSubmit={() => {
            setCurrentPage(1);
          }}
          {...commonProps}
          cardProps={{
            size: "small",
          }}
          request={
            url
              ? (tmpParams, sort) => {
                  const values = convertFiltersForLaravel(
                    formRef.current?.getFieldsValue()
                  );
                  const params = { ...tmpParams, ...values };
                  return handleRequest(url, search, params, sort);
                }
              : undefined
          }
        />
        {children}
      </Section.Grid>
    </PolicyProvider>
  );
};

export const convertFiltersForLaravel = (filter: Values) => {
  if (typeof filter === "undefined") return {};
  return formatValues(extractRecursiveKeys(filter));
};
