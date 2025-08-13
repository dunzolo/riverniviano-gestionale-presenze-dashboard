import { usePolicy } from "@/hooks/usePolicy";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, ButtonProps, Tooltip } from "antd";
import Link from "next/link";
import { useMemo } from "react";

export interface DetailButtonProps extends Omit<ButtonProps, "variant"> {
  url?: string;
  variant?: "button" | "icon";
  scroll?: boolean;
}

export const DetailButton = ({
  url,
  children,
  variant = "button",
  href,
  scroll = true,
  ...props
}: DetailButtonProps) => {
  const { authorizations } = usePolicy();

  const isIconBtn = variant === "icon";

  const icon = useMemo(() => {
    if (authorizations.update) return <EditOutlined />;
    return <EyeOutlined />;
  }, [authorizations.update]);

  const baseContent = (() => {
    if (isIconBtn) return null;
    if (children) return children;
    return "Dettaglio";
  })();

  const actionUrl = url || href;

  const button = useMemo(() => {
    if (actionUrl) {
      return (
        <Link href={actionUrl}>
          <Button type="primary" icon={isIconBtn ? icon : null} {...props}>
            {baseContent}
          </Button>
        </Link>
      );
    }

    return (
      <Button type="primary" icon={isIconBtn ? icon : null} {...props}>
        {baseContent}
      </Button>
    );
  }, [actionUrl, baseContent, icon, isIconBtn, props]);

  return <Tooltip title={isIconBtn ? "Dettaglio" : ""}>{button}</Tooltip>;
};
