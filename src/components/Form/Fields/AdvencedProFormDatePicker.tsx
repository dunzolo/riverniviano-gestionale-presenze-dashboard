import dayjs from "@/lib/dayjs";
import {
  ProFormDatePicker,
  ProFormItemProps,
} from "@ant-design/pro-components";
import { Form } from "antd";
import clsx from "clsx";
import { Dayjs } from "dayjs";
import { useFieldPath } from "../AdvancedProForm";

interface AdvencedProFormDatePickerProps extends ProFormItemProps {
  disableBeforeNow?: boolean;
}

export const AdvencedProFormDatePicker = (
  props: AdvencedProFormDatePickerProps
) => {
  Form.useFormInstance(); // se non ti serve direttamente, puoi rimuoverlo
  const path = useFieldPath(props.name);

  // formato localizzato con fallback
  const localizedL = dayjs.Ls["it"]?.formats?.L ?? "DD/MM/YYYY";
  const displayFormat = props.fieldProps?.format ?? localizedL;

  // formati da accettare in input (initialValues / valori non-Dayjs)
  const parseFormats = ["YYYY-MM-DD", displayFormat] as string[];

  // chiave del campo per transform
  const nameStr = Array.isArray(props.name)
    ? props.name.join(".")
    : String(props.name);

  // helper: qualsiasi value -> Dayjs | undefined
  const toDayjs = (val: unknown): Dayjs | undefined => {
    if (!val) return undefined;
    if (dayjs.isDayjs(val)) return val as Dayjs;
    if (typeof val === "string") {
      const parsed = dayjs(val, parseFormats, true);
      return parsed.isValid() ? parsed : undefined;
    }
    // Date/number, ecc.
    const parsed = dayjs(val as any);
    return parsed.isValid() ? parsed : undefined;
  };

  return (
    <ProFormDatePicker
      {...props}
      // 1) inizializza il valore per il DatePicker (string -> Dayjs)
      convertValue={(v: any) => toDayjs(v) ?? v}
      // 2) al submit, qualsiasi value -> "YYYY-MM-DD" (o undefined)
      transform={(value: unknown) => {
        const d = toDayjs(value);
        return { [nameStr]: d ? d.format("YYYY-MM-DD") : undefined };
      }}
      fieldProps={{
        format: displayFormat, // solo per UI
        disabledDate: (date: Dayjs) => {
          if (props.disableBeforeNow)
            return dayjs(date).isBefore(dayjs(), "day");
          if (props.fieldProps?.disabledDate)
            return props.fieldProps.disabledDate(date);
          return false;
        },
        className: clsx("w-full", props.fieldProps?.className),
        ...props.fieldProps,
        // Non forziamo più stringhe nel form durante l'editing
        // onChange: (value, dateString) => props.fieldProps?.onChange?.(value, dateString),
      }}
    />
  );
};
