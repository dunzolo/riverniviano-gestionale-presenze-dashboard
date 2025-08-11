"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import { Spin } from "antd";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  const { user, isLoading } = useUser();
  const { redirectToHome } = useAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  if (user) {
    redirectToHome();
    return null;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}
