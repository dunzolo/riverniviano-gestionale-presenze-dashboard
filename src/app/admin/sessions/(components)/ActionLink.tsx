import { CalendarOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";

interface ActionLinkProps {
  title: string;
  description: string;
  className?: string;
  onClick: () => void;
}

export const ActionLink = ({
  title,
  description,
  className,
  onClick,
}: ActionLinkProps) => {
  return (
    <div className={clsx("flex gap-2", className)}>
      <Button type="link" onClick={onClick}>
        <CalendarOutlined
          className="text-base min-w-[36px] w-[36px] h-[36px] justify-center"
          style={{
            color: "var(--color-primary-default)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--color-primary-default)",
            borderRadius: "50%",
          }}
        />
        <div>
          <strong>{title}</strong>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </Button>
    </div>
  );
};
