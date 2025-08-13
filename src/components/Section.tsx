import { useFormChangedContext } from "@/hooks/useFormChanged";
import { createQueryString } from "@/utils/queryParams";
import { ProCard, ProCardProps } from "@ant-design/pro-components";
import { Tabs as AntdTabs, App, TabsProps } from "antd";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

interface GridProps extends PropsWithChildren {
  className?: string;
  style?: React.CSSProperties;
}

interface SectionProps extends PropsWithChildren, ProCardProps {
  className?: string;
  gridClassName?: string;
}

const Grid = ({ className, children, style }: GridProps) => {
  const hasGridCols =
    className?.startsWith("grid-cols-") || className?.includes(" grid-cols-");

  return (
    <div
      style={style}
      className={clsx(
        "grid gap-4 w-full items-start",
        className,
        !hasGridCols && "grid-cols-1"
      )}
    >
      {children}
    </div>
  );
};

const Card = ({
  children,
  className,
  gridClassName,
  tabs,
  ...props
}: SectionProps) => {
  return (
    <ProCard
      headerBordered
      bordered
      className={clsx(className, "h-full")}
      size="small"
      {...props}
    >
      <Grid className={`${gridClassName ?? ""}`}>{children}</Grid>
    </ProCard>
  );
};

interface DfTabsProps extends TabsProps {
  keyName?: string;
}

const Tabs = ({
  defaultActiveKey,
  keyName,
  onChange,
  ...props
}: DfTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (activeKey: string) => {
    if (keyName) {
      const newQuery = createQueryString(searchParams, {
        [`${keyName}_tab`]: activeKey,
      });
      router.push(`${pathname}?${newQuery}`);
    }
    onChange?.(activeKey);
  };

  const initialActiveKey = (() => {
    if (keyName && searchParams.get(`${keyName}_tab`)) {
      return searchParams.get(`${keyName}_tab`) as string;
    }

    return defaultActiveKey;
  })();

  return (
    <AntdTabs
      {...props}
      activeKey={initialActiveKey}
      defaultActiveKey={initialActiveKey}
      type="line"
      onChange={handleChange}
    />
  );
};

/**
 * @description Instead of the default Section.Tabs this one checks if any of the forms inside had one or more fields changed, in that case an alert is shown to inform the user that by proceeding all unsaved changes will be lost.
 */
const ConfirmTabs = ({
  defaultActiveKey,
  keyName,
  onChange,
  ...props
}: DfTabsProps) => {
  const { modal } = App.useApp();
  const router = useRouter();
  const context = useFormChangedContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey ??
      (props.items && props.items.length > 0 ? props.items[0].key : "")
  );

  useEffect(() => {
    if (keyName && searchParams.get(`${keyName}_tab`)) {
      setActiveKey(searchParams.get(`${keyName}_tab`) as string);
    }
  }, [keyName, searchParams]);

  const handleClick = (activeKey: string) => {
    if (keyName) {
      const newQuery = createQueryString(searchParams, {
        [`${keyName}_tab`]: activeKey,
      });
      router.push(`${pathname}?${newQuery}`);
    }
  };

  const handleChange = (activeKey: string) => {
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
          onOk: () => handleClick(activeKey),
        });
      } else {
        handleClick(activeKey);
      }
    } else {
      handleClick(activeKey);
    }
  };

  return (
    <AntdTabs
      {...props}
      activeKey={activeKey}
      defaultActiveKey={activeKey}
      type="line"
      onChange={handleChange}
    />
  );
};

export const Section = {
  Grid,
  Card,
  Tabs,
  ConfirmTabs,
};
