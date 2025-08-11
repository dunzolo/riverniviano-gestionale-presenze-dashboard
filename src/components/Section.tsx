import { ProCard, ProCardProps } from "@ant-design/pro-components";
import clsx from "clsx";
import { PropsWithChildren } from "react";

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

export const Section = {
  Grid,
  Card,
};
