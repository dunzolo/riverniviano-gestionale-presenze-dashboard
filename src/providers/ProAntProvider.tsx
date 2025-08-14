import { AdvancedDescription } from "@/components/Descriptions/AdvancedDescription";
import { ApiSelectForFilters } from "@/components/Form/Fields/ApiSelect";
import { defaultFont } from "@/font";
import { useValueEnum } from "@/hooks/useValueEnum";
import { pluralize } from "@/utils/util";
import { StyleProvider } from "@ant-design/cssinjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import {
  ProAliasToken,
  ProConfigProvider,
  ProFieldFCRenderProps,
  ProFieldProps,
  ProFormSelect,
  ProRenderFieldPropsType,
} from "@ant-design/pro-components";
import { App as AntdApp, ConfigProvider } from "antd";
import it_IT from "antd/locale/it_IT";
import { ReactNode } from "react";

export interface Theme extends Partial<ProAliasToken> {
  primary?: string;
  primaryHover?: string;
  primaryActive?: string;
  background?: string;
  siderBackground?: string;
  siderCollapsedBackground?: string;
  siderMenuActive?: string;
  siderTextColor?: string;
  fontFamily?: string;
}

interface ProAntProviderProps {
  children: ReactNode;
  theme: Theme;
}

/**
 * Antd cambia i colori dei link e in alcuni casi la variabile css non funziona.
 * Questa funzione serve per estrarre il valore di una variabile css.
 */
export const getPropertyValue = (property: string) => {
  if (typeof window !== "undefined") {
    return window.getComputedStyle(document.body).getPropertyValue(property);
  }
};

export const ProAntProvider = ({ children, ...props }: ProAntProviderProps) => {
  const { valueEnum } = useValueEnum();

  const ApiSelectFilter = (_: any, props: ProFieldFCRenderProps) => {
    const [key] = props.fieldProps.id?.split("_");

    return (
      <ApiSelectForFilters
        url={`/${pluralize(key)}/all`}
        {...props}
        mode="single"
        {...props.fieldProps}
      />
    );
  };

  const valueTypeMap: Record<string, ProRenderFieldPropsType> = {
    boolean: {
      render: AdvancedDescription.Boolean,
      renderFormItem: (_, props: ProFieldFCRenderProps) => (
        <ProFormSelect
          valueEnum={valueEnum.boolean}
          proFieldProps={props as ProFieldProps}
        />
      ),
    },
    reverseBoolean: {
      render: AdvancedDescription.ReverseBoolean,
      renderFormItem: (_, props: ProFieldFCRenderProps) => (
        <ProFormSelect
          valueEnum={valueEnum.reverseBoolean}
          proFieldProps={props as ProFieldProps}
        />
      ),
    },
    pluck: {
      render: AdvancedDescription.Pluck,
      renderFormItem: ApiSelectFilter,
    },
  };

  const theme = {
    fontFamily: defaultFont.style.fontFamily,
    ...props.theme,
  };

  return (
    <AntdRegistry>
      <StyleProvider hashPriority="high">
        <ConfigProvider
          locale={it_IT}
          componentSize="middle"
          theme={{
            cssVar: true,
            components: {
              Button: {
                colorLink: theme.primary,
                colorLinkHover: theme.primaryHover,
                colorPrimary: theme.primary,
                colorPrimaryHover: theme.primaryHover,
                colorPrimaryActive: theme.primaryActive,
                primaryShadow: "none",
              },
              Table: {
                cellPaddingInlineSM: 8,
                cellPaddingBlockSM: 5,
              },
              Form: {
                verticalLabelPadding: "0 0 4px 0",
                controlHeight: undefined,
              },
              Menu: {
                colorBgElevated: `${theme.siderBackground} !important`,
                subMenuItemSelectedColor: theme.siderTextColor,
              },
              Radio: {
                buttonSolidCheckedBg: theme.primary,
                colorPrimary: theme.primary,
              },
              Select: {
                optionActiveBg: getPropertyValue("--color-primary-200"),
              },
            },
            token: {
              fontFamily: theme.fontFamily,
              colorLink: getPropertyValue("--color-primary-default"),
              colorPrimary: getPropertyValue("--color-primary-default"),
              colorPrimaryBorder: getPropertyValue("--color-primary-default"),
              colorPrimaryHover: getPropertyValue("--color-primary-default"),
            },
          }}
        >
          <ProConfigProvider token={theme} valueTypeMap={valueTypeMap}>
            <AntdApp>{children}</AntdApp>
          </ProConfigProvider>
        </ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  );
};
