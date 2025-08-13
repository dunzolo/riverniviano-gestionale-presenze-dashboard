"use client";

import { Values } from "@/types";
import React from "react";

interface ValueEnumProps {
  children: React.ReactNode;
}

export type ValueOptionsType = Record<
  string,
  {
    label: string;
    value: any;
  }[]
>;

interface ContextProps {
  valueEnum: Values;
  valueOptions: ValueOptionsType;
}

export const ValueEnumContext = React.createContext<ContextProps | undefined>(
  undefined
);

export const ValueEnumProvider = ({ children }: ValueEnumProps) => {
  const valueEnum = {
    operators: {
      "=": "=",
      "<>": "!=",
      ">": ">",
      ">=": ">=",
      "<": "<",
      "<=": "<=",
    },
    active: {
      true: "Attivo",
      false: "Non attivo",
    },
    boolean: {
      true: "Si",
      false: "No",
    },
    reverseBoolean: {
      true: "No",
      false: "Si",
    },
  };

  /**
   * Convert valueEnum to options
   * from: { bool: { true: "Si", false: "No" } }
   * to: { bool: [{ label: "Si", value: true }, { label: "No", value: false }] }
   */
  const enumToOptions = (valueEnum: Values) => {
    const valueOptions: Values = {};
    Object.keys(valueEnum).map((key) => {
      const enumData = valueEnum[key];
      const options: Values[] = [];
      Object.entries(enumData).map(([value, label]) => {
        if (value === "true") {
          options.push({ label, value: true });
          return;
        }

        if (value === "false") {
          options.push({ label, value: false });
          return;
        }

        if (Number(value)) {
          options.push({ label, value: Number(value) });
          return;
        }

        options.push({ label, value });
      });
      valueOptions[key] = options;
    });
    return valueOptions;
  };

  const valueOptions = enumToOptions(valueEnum) as ValueOptionsType;

  return (
    <ValueEnumContext.Provider value={{ valueEnum, valueOptions }}>
      {children}
    </ValueEnumContext.Provider>
  );
};

export const useValueEnum = () =>
  React.useContext(ValueEnumContext) as ContextProps;
