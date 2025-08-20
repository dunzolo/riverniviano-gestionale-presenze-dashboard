/**
 * We had to implement this workaround because in some cases, especially when typing quickly,
 * the field gets passed as a string (including the prefix or suffix) instead of the floatValue.
 * This is probably because onValueChange resolves before Antd sets the value in the form object.
 */
import { getSeparators } from "@/utils/util";
import {
  ProForm,
  ProFormFieldProps,
  ProFormItemProps,
} from "@ant-design/pro-components";
import { InputNumber } from "antd";
import { NamePath } from "antd/es/form/interface";
import clsx from "clsx";
import { FocusEventHandler, useState } from "react";
import { useDebounce } from "react-use";

export interface NumberInputProps extends ProFormFieldProps {
  name: NamePath;
  required?: boolean;
  proFormItemProps?: ProFormItemProps;
  initialValue?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  decimalScale?: number;
  defaultValue?: number;
  onAfterChange?(debounced?: number): void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
}

export const NumberInput = ({
  proFormItemProps,
  initialValue,
  prefix,
  suffix,
  placeholder,
  decimalScale,
  defaultValue,
  onAfterChange,
  onFocus,
  fieldProps,
  ...props
}: NumberInputProps) => {
  const [value, setValue] = useState(initialValue);

  useDebounce(() => onAfterChange?.(value), 400, [value]);

  const separators = getSeparators("it");

  return (
    <ProForm.Item {...props}>
      <InputNumber<number>
        addonAfter={suffix}
        addonBefore={prefix}
        placeholder={placeholder ?? "Digita"}
        onFocus={onFocus}
        defaultValue={defaultValue}
        {...fieldProps}
        onChange={(value) => {
          setValue(value ?? 0);
          fieldProps?.onChange && fieldProps?.onChange(props, value);
        }}
        formatter={(value: number) => {
          let parts = value.toString().split(".");
          parts[0] = parts[0].replace(
            /\B(?=(\d{3})+(?!\d))/g,
            separators.thousands
          );
          return parts.join(separators.decimals);
        }}
        parser={(value) => {
          const regex = separators.thousands === "." ? /(\.*)/g : /(,*)/g;
          return value
            ?.replace(regex, "")
            .replace(separators.decimals, ".") as unknown as number;
        }}
        className={clsx("!w-full", fieldProps?.className)}
      />
    </ProForm.Item>
  );
};
