import { usePolicy } from "@/hooks/usePolicy";
import { PlusOutlined } from "@ant-design/icons";
import { Button, ButtonProps } from "antd";
import { useRouter } from "next/navigation";

interface CreateButtonProps extends ButtonProps {
  url?: string;
}

export const CreateButton = ({
  url,
  children,
  ...props
}: CreateButtonProps) => {
  const router = useRouter();
  const { authorizations } = usePolicy();

  if (authorizations.create)
    return (
      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => url && router.push(url)}
        {...props}
      >
        {children ?? "Aggiungi"}
      </Button>
    );

  return null;
};
