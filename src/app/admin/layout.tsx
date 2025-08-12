"use client";

import { useUser } from "@/hooks/useUser";
import { AdminPanelLayout } from "@/layouts/AdminPanelLayout";
import { MenuItem } from "@/types";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { FiHome, FiUser } from "react-icons/fi";

export default function Layout({ children }: PropsWithChildren) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Spin />
      </div>
    );
  }

  const theme = {
    primary: "var(--color-primary-default)",
    primaryHover: "var(--color-primary-400)",
    primaryActive: "var(--color-primary-600)",
    siderBackground: "var(--color-primary-dark)",
    siderCollapsedBackground: "var(--color-primary-default)",
    siderMenuActive: "rgba(255,255,255,0.15)",
    siderTextColor: "#FFFFFF",
  };

  const menu: MenuItem[] = [
    {
      role_names: ["full-access", "operator"],
      path: `/admin/dashboard`,
      icon: <FiHome />,
      name: "Dashboard",
    },
    {
      role_names: ["full-access"],
      path: `/admin/user-admins`,
      icon: <FiUser />,
      name: "Utenti",
    },
  ];

  const logo = { expanded: "/images/logo.png", collapsed: "/images/icon.png" };

  return (
    <AdminPanelLayout theme={theme} menu={menu} logo={logo}>
      {children}
    </AdminPanelLayout>
  );
}
