import { FilterFilled, FilterOutlined } from "@ant-design/icons";
import { useToken } from "@ant-design/pro-components";
import { Badge, Button, Tooltip } from "antd";
import clsx from "clsx";

interface ToggleFilterButtonProps {
  open: boolean;
  count: number;
  className?: string;
  mode?: "icon" | "button";
  onClick: () => void;
}

export const ToggleFilterButton = ({
  open,
  count,
  className,
  onClick,
  mode = "icon",
}: ToggleFilterButtonProps) => {
  const { token } = useToken();

  const renderIcon = () => {
    const Icon = open ? FilterFilled : FilterOutlined;
    return (
      <Badge count={count} size="small">
        <Icon
          className={clsx(
            "cursor-pointer hover:text-primary-default",
            open && "!text-primary-default"
          )}
          style={{ fontSize: token.fontSizeLG }}
        />
      </Badge>
    );
  };

  return (
    <div className={clsx("cursor-pointer", className)} onClick={onClick}>
      <Tooltip title={open ? "Chiudi filtri" : "Apri filtri"}>
        {mode === "button" && (
          <Button
            type="text"
            style={{ fontSize: token.fontSizeLG }}
            icon={renderIcon()}
          />
        )}
        {mode === "icon" && renderIcon()}
      </Tooltip>
    </div>
  );
};
