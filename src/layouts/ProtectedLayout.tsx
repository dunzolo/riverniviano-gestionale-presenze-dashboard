import { useUser } from "@/hooks/useUser";
import { Spin } from "antd";
import { PropsWithChildren } from "react";

export const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { user, authenticated, isLoading } = useUser();

  if (isLoading && !user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  if (!authenticated && typeof window !== "undefined") {
    // here we can't use router
    window.location.pathname = `/auth/login`;
    return null;
  }

  if (
    user?.need_password_update !== "no" &&
    typeof window !== "undefined" &&
    window.location.pathname !== `/auth/update-password`
  ) {
    // here we can't use router
    window.location.pathname = `/auth/update-password`;
    return null;
  }

  return (
    <div>
      <main>{children}</main>
    </div>
  );
};
