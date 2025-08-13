"use client";

import { useApi } from "@/hooks/useApi";
import { FormLoadingProvider, useFormLoading } from "@/hooks/useFormLoading";
import { Item, Values } from "@/types";
import {
  FormListContext,
  ProForm,
  ProFormInstance,
  ProFormProps,
} from "@ant-design/pro-components";
import { App } from "antd";
import { NamePath } from "antd/es/form/interface";
import clsx from "clsx";
import _, { isArray } from "lodash";
import { ReactNode, RefObject, useContext, useRef, useState } from "react";

/**
 * Set errors in form,
 *  usually called after api validation
 */
export const setErrors = (
  ref?: RefObject<ProFormInstance>,
  errors?: Record<string, string[]>
) => {
  const form = ref?.current;
  if (!form || !errors) return false;

  setErrorsInstance(form, errors);
};

/**
 * @description Instead of taking the form ref as a parameter like the setErrors method, this one takes directly the form instance!
 * @param form Form instance
 * @param errors Errors from API
 */
export const setErrorsInstance = (
  form: ProFormInstance,
  errors?: Record<string, string[]>
) => {
  if (!errors) return false;

  // Reset all fields before setting errors
  const fieldsError = form.getFieldsError();
  fieldsError.map(({ name, errors }) => {
    if (errors?.length) form.setFields([{ name, errors: [] }]);
  });

  const keys = Object.keys(errors);

  keys.map((key) => {
    // Validazione dynamic form: dobbiamo convertire il nome in un array [array_name, index, field_name]
    const keyNames = key.split(".").map((item) => {
      if (!Number.isNaN(+item)) return Number(item);
      return item;
    });
    form.setFields([{ name: keyNames, errors: [...errors[key]] }]);

    if (
      keyNames?.length > 1 &&
      typeof keyNames[keyNames?.length - 1] === "number"
    ) {
      keyNames.pop();
      form.setFields([{ name: keyNames, errors: [...errors[key]] }]);
    }
  });

  if (keys.length > 0) {
    const fieldsName = Object.keys(form.getFieldsValue()).filter((name) => {
      // Necessary to handle validation of nested items.
      return (
        keys.findIndex((key: string) => {
          const splitValues = key.split(".");
          return splitValues.includes(name);
        }) >= 0
      );
    });
    if (fieldsName && fieldsName.length) {
      // TODO: metodo non ottimale, non ho trovato un modo per farlo con react
      // la difficoltà sta nel trovare il primo elemento visibile nella pagina,
      // tenendo conto che un elemento in desktop potrebbe essere in alto a destra mentre da mobile in fondo
      // sotto questo setTimeout è presente il codice di prima, che non teneva conto dell'elemento in pagina (mobile o desktop)
      setTimeout(function () {
        const elements = document.querySelectorAll(
          ".ant-form-item-has-error, .ant-form-item-explain-error"
        );
        let topMin = Number.POSITIVE_INFINITY;

        elements.forEach(function (element) {
          const topElement = element.getBoundingClientRect().top;
          if (topElement < topMin) {
            topMin = topElement;
          }
        });

        window.scrollTo({
          top: topMin + window.scrollY - 70,
          behavior: "smooth",
        });
      }, 300);
    }

    return true;
  }

  return false;
};

/**
 * remove errors in form,
 * usually called when user touch field
 */
export const removeErrors = (ref: RefObject<ProFormInstance>, data?: Item) => {
  const form = ref?.current;
  if (!form || !data) return;

  // Serve per prendere tutte le chiavi degli oggetti nidificati e farne un array
  // così da poter fare l'unset di un errore quando viene compilato un campo in un dynamic form
  const getSchema = (
    val: Record<string, any> | string,
    keys: string[] = []
  ): (string | number | undefined)[] => {
    if (_.isObject(val)) {
      return _.flatMap(val, (v, k) => {
        if (typeof v !== "undefined") {
          return getSchema(v, [...keys, k]);
        }
      }); // iterate it and call fn with the value and the collected keys
    }
    return keys;
  };

  const result = getSchema(data).filter((item: any) => item !== undefined) as (
    | string
    | number
  )[];

  form.setFields([{ name: result, errors: [] }]);

  // Le select multiple arrivano ad avere result come array ma il name in realtà è solo in prima posizione
  // TODO: controllare in caso di select multipla in dynamic form
  if (isArray(result)) form.setFields([{ name: result[0], errors: [] }]);
};

/**
 * We created this hook to get the field name
 * when we are in a repeater form
 */
export const useFieldPath = (name: NamePath | undefined) => {
  const listContext = useContext(FormListContext);

  // no name is provided
  if (!name) return [];

  // we are under form list (repeater)
  if (listContext.listName) {
    return [...listContext?.listName, name];
  }

  if (!Array.isArray(name)) return [name];

  // we are outside repeater
  return name;
};

export interface FormProps extends ProFormProps {
  url?: string;
  method?: "post" | "patch";
  children?: ReactNode;
  onSuccess?(value?: any): Promise<any> | void;
  onError?(value?: any): Promise<any> | void;
  submitText?: string;
  formRef?: RefObject<ProFormInstance>;
  onSubmit?(values: Values): void;
}

const AdvancedProFormContainer = ({
  url,
  method: formMethod,
  submitText,
  onSuccess,
  onError,
  onSubmit,
  ...props
}: FormProps) => {
  const [loading, setLoading] = useState(false);
  const { isFormLoading } = useFormLoading();
  const { makeRequest } = useApi();
  const { message } = App.useApp();

  const localRef = useRef<any>(undefined) as RefObject<ProFormInstance>;
  const ref = props.formRef ?? localRef;
  const touched = useRef(false);

  const method = formMethod ?? (!!props.initialValues?.id ? "patch" : "post");

  const handleSubmit = async (values: Values) => {
    if (onSubmit) return onSubmit(values);
    if (!url) return Promise.reject("Add url or submit props");

    try {
      setLoading(true);
      const response = await makeRequest(url, method, values);
      touched.current = false;
      message.success("Salvataggio avvenuto con successo");
      onSuccess && (await onSuccess(response));
      return response;
    } catch (errors: any) {
      onError && (await onError(errors));
      const checkInputError = setErrors(ref, errors);
      if (!checkInputError) {
        message.error("Qualcosa è andato storto");
      }
      return Promise.reject(errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProForm
      omitNil={false}
      className={clsx(props.className)}
      formRef={ref}
      onFinish={handleSubmit}
      onValuesChange={(data: any) => removeErrors(ref, data)}
      loading={loading || isFormLoading}
      submitter={{
        searchConfig: {
          submitText: submitText ?? "Salva",
        },
        resetButtonProps: { style: { display: "none" } },
      }}
      autoFocusFirstInput
      onFieldsChange={(changedValue: any) => {
        if (touched.current) return;
        for (const value of changedValue) {
          touched.current = value.touched;
          if (touched.current) return;
        }
      }}
      autoComplete="off"
      spellCheck="false"
      autoCorrect="off"
      autoCapitalize="off"
      {...props}
    >
      {props.children}
    </ProForm>
  );
};

const AdvancedProForm = (props: FormProps) => {
  return (
    <FormLoadingProvider>
      <AdvancedProFormContainer {...props} />
    </FormLoadingProvider>
  );
};

AdvancedProForm.Group = ProForm.Group;
AdvancedProForm.Item = ProForm.Item;
AdvancedProForm.ErrorList = ProForm.ErrorList;

export { AdvancedProForm };
