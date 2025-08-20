"use client";

import { useUser } from "@/hooks/useUser";
import { AdminPanelLayout } from "@/layouts/AdminPanelLayout";
import { MenuItem } from "@/types";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { FiCalendar, FiHome, FiUser } from "react-icons/fi";
import { IoIosFootball } from "react-icons/io";
import { IoShirtOutline } from "react-icons/io5";

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
      bottom: true,
    },
    {
      role_names: ["full-access"],
      path: `/admin/users`,
      icon: <FiUser />,
      name: "Utenti",
      bottom: true,
    },
    {
      role_names: ["full-access"],
      path: `/admin/seasons`,
      icon: <FiCalendar />,
      name: "Stagioni",
      bottom: true,
    },
    {
      role_names: ["full-access", "operator"],
      path: `/admin/players`,
      icon: <IoShirtOutline />,
      name: "Atleti",
      bottom: true,
    },
    {
      role_names: ["full-access", "operator"],
      path: `/admin/sessions`,
      icon: <IoIosFootball />,
      name: "Attività",
      bottom: true,
    },
  ];

  const logo = { expanded: "/images/logo.png", collapsed: "/images/icon.png" };

  return (
    <AdminPanelLayout theme={theme} menu={menu} logo={logo}>
      {children}
    </AdminPanelLayout>
  );
}
