"use client";

import {
  FormChangedContextProvider,
  useFormChangedContext,
} from "@/hooks/useFormChanged";
import { PolicyProvider } from "@/hooks/usePolicy";
import { Values } from "@/types";
import { createQueryString, deleteQueryParams } from "@/utils/queryParams";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { App, Drawer, DrawerProps, Modal, ModalProps, Spin } from "antd";
import clsx from "clsx";
import { isArray } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  JSX,
  PropsWithChildren,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CreateButton } from "./Buttons/CreateButton";
import { DeleteButton, DeleteButtonProps } from "./Buttons/DeleteButton";
import { DetailButton } from "./Buttons/DetailButton";
import { CustomColumn, DataTable, DataTableProps } from "./DataTable";
import { FormProps } from "./Form/AdvancedProForm";
import { FormSubmitter } from "./Form/FormSubmitter";
import { ItemLoader } from "./ItemLoader";
import { Section } from "./Section";

interface Tab {
  key: string;
  label: string;
  children: ReactNode;
}

export type CrudDataTableType = "default" | "drawer" | "modal";

export interface CrudDataTableActions {
  setLoading: Dispatch<SetStateAction<boolean>>;
  handleChangeItem: (item?: Values) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  reloadTable: () => void;
  handleBack: () => void;
}

interface ContextProps extends CrudDataTableActions {
  item?: Values;
  type: CrudDataTableType;
  loading: boolean;
  open: boolean;
}

export const CrudDataTableContext = createContext<ContextProps | undefined>(
  undefined
);

export const useCrudDataTable = () =>
  useContext(CrudDataTableContext) as ContextProps;

interface OptionalDeleteButtonProps extends Omit<DeleteButtonProps, "url"> {
  url?: string;
}

export interface CrudDataTableProps
  extends Omit<DataTableProps, "form" | "type" | "title" | "actionRef"> {
  title?: string;
  url: string;
  type?: CrudDataTableType;
  tabs?: Tab[] | ((item: Values) => Tab[]);
  actionRef?: RefObject<ActionType | undefined>;
  paged?: boolean;
  form?: (props: FormProps) => JSX.Element;
  formProps?: FormProps;
  formRender?: (item: Values) => ReactNode;
  keyName?: string;
  keyField?: string;
  actionOnSave?: "detail" | "list";
  hideCreateButton?: boolean;
  deleteButtonProps?: OptionalDeleteButtonProps;
  modalProps?: ModalProps;
  drawerProps?: DrawerProps;
}

export const CrudDataTable = ({
  form: Form,
  formProps,
  formRender,
  url,
  type = "default",
  title,
  tabs,
  toolbar,
  className,
  actionRef,
  actionOnSave = "detail",
  // Used to check if render the crud data table inside a PageContainer or as a simple component.
  paged = true,
  keyName,
  keyField = "id",
  hideCreateButton = false,
  deleteButtonProps,
  modalProps,
  drawerProps,
  ...props
}: CrudDataTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultTableRef = useRef<ActionType>(undefined);
  const tableRef = actionRef ?? defaultTableRef;

  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState<Values>();
  const [item, setItem] = useState<Values>();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const cleanedUpUrl = (() => {
    const splitted = url?.split("/");
    const output = splitted?.[splitted.length - 1];
    return output ?? url?.replace("/", "");
  })();

  const internalKeyName = keyName ? `${keyName}_id` : `${cleanedUpUrl}_id`;

  const queryItemId = useMemo(() => {
    return searchParams.get(internalKeyName);
  }, [searchParams, internalKeyName]);

  useEffect(() => {
    if (queryItemId) {
      if (queryItemId !== "create") {
        setItemId({ [keyField]: queryItemId });
      } else {
        setItemId({});
      }
      setOpen(true);
    } else {
      setOpen(false);
      setItem(undefined);
      setItemId({});
    }

    setLoadingPage(false);
  }, [router, queryItemId]);

  const handleChangeItem = (item: Values | undefined) => {
    // Set to false the loading to avoid problems when the form is submitted and a redirect is made.
    setLoading(false);
    if (item?.[keyField]) {
      setItemId(item);
      const newQuery = createQueryString(searchParams, {
        [internalKeyName]: item?.[keyField],
      });
      router.push(`${pathname}?${newQuery}`, {
        scroll: type !== "default" ? false : true,
      });
    }
    // If handleChangeitem receive undefined or null it will perform a redirect to the table.
    if (!item) {
      setItem(undefined);
      const tabName = `${keyName ?? cleanedUpUrl}_tab`;
      const queryString = deleteQueryParams(searchParams, [
        internalKeyName,
        tabName,
      ]);
      router.push(`${pathname}?${queryString}`, {
        scroll: type !== "default" ? false : true,
      });
    }
  };
  const key = itemId?.[keyField];
  const itemUrl = key ? `${url}/${key}` : url;

  const componentMap = {
    default: DefaultCrud,
    modal: ModalCrud,
    drawer: DrawerCrud,
  };

  const Component = componentMap[type];

  const reloadTable = () => {
    tableRef.current?.reload();
  };

  const handleBack = () => {
    handleChangeItem(undefined);
    setOpen(false);
  };

  const baseForm = (initialValues: Values | undefined, mutate?: Function) => {
    if (!initialValues) return null;

    // If form render is specified, instead of rendering the default form i'll call the formRender function which will render a custom form.
    // I'll pass each function needed to control the CrudDataTable state like loading, item, etc...
    if (formRender) return formRender(initialValues);

    if (!Form) return null;

    return (
      <Form
        key={initialValues.id}
        readonly={queryItemId === "create" ? false : undefined}
        onLoadingChange={setLoading}
        initialValues={initialValues}
        url={itemUrl}
        onSuccess={({ data }) => {
          tableRef.current?.reload();
          mutate && mutate();

          if (actionOnSave === "detail") {
            handleChangeItem(data);
          }

          if (actionOnSave === "list") {
            handleChangeItem(undefined);
            setOpen(false);
          }
        }}
        submitter={{
          searchConfig: {
            submitText: "Salva",
          },
          resetButtonProps: {
            style: { display: "none" },
          },
          render: (_, dom) => <CrudDataTableFooter>{dom}</CrudDataTableFooter>,
        }}
        {...formProps}
      />
    );
  };

  const renderContent = () => {
    if (!open) return null;

    if (tabs && key) {
      return (
        <ItemLoader url={itemUrl}>
          {(item, mutate) => {
            const _tabs = isArray(tabs) ? tabs : tabs(item);

            return (
              <FormChangedContextProvider>
                <Tabs
                  keyName={keyName ?? cleanedUpUrl}
                  itemUrl={itemUrl}
                  setItem={setItem}
                  mutate={mutate}
                  baseForm={baseForm}
                  tabs={_tabs}
                />
              </FormChangedContextProvider>
            );
          }}
        </ItemLoader>
      );
    }

    if (!key) return baseForm(itemId);

    return (
      <ItemLoader url={itemUrl} onItemChange={setItem}>
        {(item, mutate) => (
          <FormChangedContextProvider>
            {baseForm(item, mutate)}
          </FormChangedContextProvider>
        )}
      </ItemLoader>
    );
  };

  // If crud isn't paged instead of wrapping everything under PageContainer i'll just wrap it with a react fragment giving
  // the ability of use a crud data table everywhere.
  const Container = useMemo(() => {
    if (!paged) return EmptyContainer;
    return PageContainer;
  }, [paged]);

  if (loadingPage) {
    return (
      <div className="w-full flex justify-center mt-[8.25rem]">
        <Spin size="large" />
      </div>
    );
  }

  const columns = props.columns?.map((column) => {
    if (column.detail) {
      return {
        ...column,
        render: (node, item) => (
          <PolicyProvider authorizations={item.authorizations}>
            <DetailButton
              href={`${pathname}?${createQueryString(searchParams, {
                [internalKeyName]: item?.[keyField],
              })}`}
              type="link"
              className="!p-0 !m-0 !h-auto w-full !text-left !justify-start"
            >
              {node}
            </DetailButton>
          </PolicyProvider>
        ),
      } as CustomColumn;
    }

    return column;
  });

  const context = {
    item,
    type,
    loading,
    open,
    setLoading,
    handleChangeItem,
    handleBack,
    setOpen,
    reloadTable,
  };

  return (
    <CrudDataTableContext.Provider value={context}>
      {props.children}
      <Container>
        <DataTable
          options={{
            density: false,
            setting: false,
          }}
          className={clsx(
            className,
            type === "default" && itemId && open && "hidden"
          )}
          url={url}
          actionRef={tableRef}
          toolbar={{
            ...toolbar,
            actions: [
              ...(toolbar?.actions ?? []),
              !hideCreateButton && (
                <CreateButton
                  key="create"
                  onClick={() => {
                    const newQuery = createQueryString(searchParams, {
                      [internalKeyName]: "create",
                    });
                    router.push(`${pathname}?${newQuery}`, {
                      scroll: type !== "default" ? false : true,
                    });
                    handleChangeItem({});
                    setOpen(true);
                  }}
                />
              ),
            ],
          }}
          actionColumnProps={{ width: 70 }}
          renderDetailButton={(item) => (
            <DetailButton
              variant="icon"
              size="small"
              type="text"
              href={`${pathname}?${createQueryString(searchParams, {
                [internalKeyName]: item?.[keyField],
              })}`}
              scroll={type === "default" ? true : false}
            />
          )}
          renderDeleteButton={(item) => (
            <DeleteButton
              item={item}
              variant="icon"
              size="small"
              type="text"
              url={`${url}/${item[keyField]}`}
              onSuccess={() => {
                tableRef.current?.reload();
              }}
              {...deleteButtonProps}
            />
          )}
          {...props}
          columns={columns}
        >
          <Component
            open={open}
            {...modalProps}
            {...drawerProps}
            onClose={() => {
              setOpen(false);
              const tabName = `${keyName ?? cleanedUpUrl}_tab`;
              const queryString = deleteQueryParams(searchParams, [
                internalKeyName,
                tabName,
              ]);
              router.push(`${pathname}?${queryString}`, {
                scroll: type !== "default" ? false : true,
              });
            }}
          >
            {renderContent()}
          </Component>
        </DataTable>
      </Container>
    </CrudDataTableContext.Provider>
  );
};

const Tabs = ({
  keyName,
  itemUrl,
  setItem,
  mutate,
  baseForm,
  tabs,
}: {
  keyName?: string;
  itemUrl: string;
  setItem: (value: SetStateAction<Values | undefined>) => void;
  mutate: Function;
  baseForm: (initialValues: Values | undefined, mutate?: Function) => ReactNode;
  tabs: Tab[];
}) => {
  return (
    <Section.ConfirmTabs
      keyName={keyName}
      destroyInactiveTabPane
      items={[
        {
          key: "detail",
          label: "Dettaglio",
          children: (
            <ItemLoader url={itemUrl}>
              {(item) => {
                setItem(item);
                return baseForm(item, mutate);
              }}
            </ItemLoader>
          ),
        },
        ...tabs.map((tab) => {
          return {
            ...tab,
            children: (
              <ItemLoader url={itemUrl}>
                {(item) => {
                  setItem(item);
                  return tab.children;
                }}
              </ItemLoader>
            ),
          };
        }),
      ]}
    />
  );
};

/* Used when the CrudDataTable isn't used as a PageContainer but just as a simple component. */
const EmptyContainer = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

interface ComponentProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

const ModalCrud = ({ open, children, onClose, ...props }: ComponentProps) => {
  return (
    <Modal
      footer={null}
      width={800}
      destroyOnClose
      maskClosable={false}
      onCancel={onClose}
      open={open}
      {...props}
    >
      {children}
    </Modal>
  );
};

const DrawerCrud = ({ open, children, onClose, ...props }: ComponentProps) => {
  return (
    <Drawer
      className="relative"
      width={800}
      onClose={onClose}
      open={open}
      destroyOnClose
      maskClosable={false}
      {...props}
    >
      <Section.Grid className="pb-16">{children}</Section.Grid>
    </Drawer>
  );
};

export const DefaultCrud = ({ children }: ComponentProps) => {
  return (
    <div className="space-y-2">
      <Section.Grid>{children}</Section.Grid>
    </div>
  );
};

interface CrudDataTableFooterProps {
  children?: ReactNode;
}

export const CrudDataTableFooter = ({ children }: CrudDataTableFooterProps) => {
  const { type, loading, handleBack } = useCrudDataTable();
  const { modal } = App.useApp();
  const context = useFormChangedContext();

  const checkHandleBack = () => {
    if (context && Object.keys(context.checkFormChanged).length > 0) {
      var formChanged = false;
      // context.checkFormChanged contains for each child form a function
      // used to check if any field has been changed.
      for (const [key, fn] of Object.entries(context.checkFormChanged)) {
        formChanged = fn();
        if (formChanged) break;
      }
      if (formChanged) {
        modal.confirm({
          title: "Attenzione",
          content:
            "Tutte le modifiche non salvate andranno perse, vuoi continuare?",
          onOk: () => handleBack(),
        });
      } else {
        handleBack();
      }
    } else {
      handleBack();
    }
  };

  return (
    <FormSubmitter type={type} loading={loading} onBack={checkHandleBack}>
      {children}
    </FormSubmitter>
  );
};
