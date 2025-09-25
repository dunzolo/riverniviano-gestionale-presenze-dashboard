import { CalendarOutlined } from "@ant-design/icons";
import Link from "next/link";

interface ActionLinkProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const ActionLink = ({
  title,
  description,
  onClick,
}: ActionLinkProps) => {
  return (
    <Link
      href={{
        pathname: "sessions",
        query: {
          sessions_id: "create",
        },
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mt-4 px-3">
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
      </div>
    </Link>
  );
};
