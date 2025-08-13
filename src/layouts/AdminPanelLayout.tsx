"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { ProAntProvider, Theme } from "@/providers/ProAntProvider";
import { MenuItem } from "@/types";
import { UserOutlined } from "@ant-design/icons";
import { ProLayout, useToken } from "@ant-design/pro-components";
import { Dropdown } from "antd";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useMemo, useState } from "react";
import { FiBell, FiUser } from "react-icons/fi";
import { useWindowSize } from "react-use";
import { ProtectedLayout } from "./ProtectedLayout";

type LogoType = {
  expanded: string;
  collapsed: string;
};

interface AdminPanelLayoutProps extends PropsWithChildren {
  theme: Theme;
  logo: LogoType;
  menu: MenuItem[];
}

export const AdminPanelLayout = ({
  theme,
  ...props
}: AdminPanelLayoutProps) => {
  const baseTheme: Theme = {
    ...theme,
    layout: {
      ...theme.layout,
      pageContainer: {
        paddingBlockPageContainerContent: 16,
        paddingInlinePageContainerContent: 24,
        ...theme.layout?.pageContainer,
      },
      sider: {
        colorBgCollapsedButton: theme.siderCollapsedBackground,
        colorTextCollapsedButtonHover: theme.siderTextColor,
        colorTextCollapsedButton: theme.siderTextColor,
        colorMenuBackground: theme.siderBackground,
        colorBgMenuItemCollapsedElevated: theme.siderBackground,
        colorMenuItemDivider: "rgba(0,0,0,0)",
        colorBgMenuItemHover: "rgba(0,0,0,0.1)",
        colorBgMenuItemActive: theme.siderBackground,
        colorBgMenuItemSelected: theme.siderMenuActive,
        colorTextMenuSelected: theme.siderTextColor,
        colorTextMenuItemHover: theme.siderTextColor,
        colorTextMenuActive: theme.siderTextColor,
        colorTextMenu: theme.siderTextColor,
        colorTextMenuSecondary: theme.siderTextColor,
        colorTextMenuTitle: theme.siderTextColor,
        colorTextSubMenuSelected: theme.siderTextColor,
        ...theme.layout?.sider,
      },
      header: {
        colorBgHeader: theme.siderBackground,
        colorBgScrollHeader: "ff0000",
        colorHeaderTitle: theme.siderTextColor,
        colorBgMenuItemHover: theme.background,
        colorBgMenuElevated: theme.background,
        colorBgMenuItemSelected: theme.siderMenuActive,
        colorTextMenuSelected: theme.siderTextColor,
        colorTextMenuActive: theme.siderTextColor,
        colorTextMenu: theme.siderTextColor,
        colorTextMenuSecondary: theme.siderTextColor,
        colorBgRightActionsItemHover: theme.background,
        colorTextRightActionsItem: theme.siderTextColor,
        ...theme.layout?.header,
      },
    },
  };

  return (
    <ProAntProvider theme={baseTheme}>
      <AuthProvider>
        <AdminPanelLayoutContent theme={baseTheme} {...props} />
      </AuthProvider>
    </ProAntProvider>
  );
};

const AdminPanelLayoutContent = ({
  theme,
  logo,
  menu,
  children,
}: AdminPanelLayoutProps) => {
  const pathname = usePathname();
  const { user } = useUser();
  const { width } = useWindowSize();
  const { token } = useToken();

  const isMobile = width <= token.screenMD;
  const [menuCollapsed, setMenuCollapsed] = useState(isMobile);

  const filterMenu = (menu: MenuItem[]): MenuItem[] => {
    // Filtra il menu in base alle funzionalità dell'utente
    const roleNames = user?.role_names ?? [];

    return menu.filter((item) => {
      if (item.role_names?.includes("*")) return true;

      // Se l'elemento ha figli, filtra ricorsivamente i figli e verifica se ce ne sono almeno uno
      if (item.children) {
        item.children = filterMenu(item.children);
        return item.children.length > 0;
      }

      // Se l'elemento ha una funzionalità specifica, verifica se l'utente ha accesso
      if (item.role_names) {
        if (Array.isArray(item.role_names)) {
          return roleNames.some((el: any) => item.role_names?.includes(el));
        }
        return roleNames.includes(item.role_names);
      }

      // Se l'elemento non ha una funzionalità specifica, significa che è aperto a tutti
      return true;
    });
  };

  const formatMenu = (menu: MenuItem[] | any[]): MenuItem[] => {
    return menu.map((item) => {
      // Costruisco in modo ricorsivo un array di funzionalità
      // per mostrare una voce di menu se almeno un figlio
      // contiene una funzionalità a cui l'utente ha accesso
      const childFunctionalities = item?.children?.map(
        (el: MenuItem) => el.role_names
      );
      const functionalities = [item.role_names, childFunctionalities];

      return {
        ...item,
        active: true,
        role_names: functionalities.flat().filter(Boolean),
        key: item.key ?? item.path,
        label: item.name,
        children: item.children && formatMenu(item.children),
      };
    });
  };

  const menuItems = useMemo(() => filterMenu(formatMenu(menu)), [menu, user]);
  const bottomItems = useMemo(
    () => menuItems.filter((m) => m.bottom && m.path).slice(0, 5),
    [menuItems]
  );

  const userDropdown = [
    {
      key: "logout",
      label: <Link href={`/auth/logout`}>Esci</Link>,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <ProtectedLayout>
        <ProLayout
          collapsed={!isMobile ? menuCollapsed : true}
          onCollapse={setMenuCollapsed}
          className={clsx(
            "min-h-screen",
            isMobile && "pb-[calc(56px+env(safe-area-inset-bottom))]"
          )}
          layout="side"
          breadcrumbRender={(items) => [
            { breadcrumbName: "Home" },
            ...(items || []),
          ]}
          pageTitleRender={false}
          title="" // hide antd name
          logo={false}
          token={theme.layout}
          headerRender={() => (!isMobile ? null : <CustomHeader />)}
          menuHeaderRender={(_, __, props) => {
            if (props?.layout === "mix" || props?.isMobile) return null;
            return <Logo logo={logo} collapsed={props?.collapsed} />;
          }}
          headerTitleRender={(_, __, props) => {
            return <Logo logo={logo} collapsed={props?.collapsed} />;
          }}
          itemRender={({ path, breadcrumbName }: any) => {
            if (isMobile) return null;
            if (path) {
              const isActive = pathname === path;
              return (
                <Link
                  className={clsx(
                    isActive && "!text-primary-default font-bold"
                  )}
                  href={path}
                >
                  {breadcrumbName}
                </Link>
              );
            }
            return <div>{breadcrumbName}</div>;
          }}
          route={{ routes: menuItems }}
          location={{ pathname }}
          menuItemRender={(item, dom) => {
            if (isMobile) return null;
            if (item.path?.startsWith("mailto:")) {
              return <a href={item.path}>{dom}</a>;
            }

            if (item.key) {
              return (
                <Link
                  href={item.key}
                  onClick={() => {
                    if (width <= token.screenMD) setMenuCollapsed(true);
                  }}
                >
                  {dom}
                </Link>
              );
            }

            return dom;
          }}
          avatarProps={{
            icon: <UserOutlined />,
            size: "small",
            title: user?.name,
            render: (props, dom) => (
              <>
                <Dropdown
                  arrow
                  className="cursor-pointer"
                  trigger={["click"]}
                  menu={{ items: userDropdown }}
                >
                  {dom}
                </Dropdown>
              </>
            ),
          }}
        >
          <div
            className={clsx(
              isMobile && "pb-[calc(56px+env(safe-area-inset-bottom))]"
            )}
          >
            {children}
          </div>
        </ProLayout>

        {/* 🔥 Mobile Bottom Tab Bar */}
        {isMobile && bottomItems.length > 0 && (
          <MobileTabBar items={bottomItems} activePath={pathname} />
        )}
      </ProtectedLayout>
    </div>
  );
};

interface LogoProps {
  className?: string;
  collapsed?: boolean;
  logo: LogoType;
}

const Logo = ({ collapsed, className, logo }: LogoProps) => {
  const width = collapsed ? 30 : 130;
  const height = collapsed ? 30 : 29;

  return (
    <div className={clsx("relative", className)}>
      <Image
        width={width}
        height={height}
        style={{ height, width }}
        className="object-contain"
        src={collapsed ? logo.collapsed : logo.expanded}
        alt="Logo"
      />
    </div>
  );
};

function MobileTabBar({
  items,
  activePath,
}: {
  items: MenuItem[];
  activePath: string;
}) {
  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        "border-t border-gray-200",
        "pt-1 pb-[calc(8px+env(safe-area-inset-bottom))]"
      )}
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <ul className="mx-auto max-w-screen-md grid grid-cols-5 gap-1 px-2">
        {items.map((it) => {
          const isActive = activePath === it.path;
          return (
            <li key={it.key ?? it.path} className="flex">
              <Link
                href={it.path!}
                className={clsx(
                  "flex-1 flex flex-col items-center justify-center",
                  "h-14 rounded-xl",
                  isActive
                    ? "!text-primary-default font-medium"
                    : "!text-gray-600"
                )}
              >
                <span className="text-xl leading-none">{it.icon}</span>
                <span className="text-[11px] leading-3 mt-1">{it.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const CustomHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-primary-default text-white shadow">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/images/logo.png" alt="Logo" className="h-8" />
        <span className="font-bold text-lg">My App</span>
      </div>

      {/* Azioni lato destro */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-white/10">
          <FiBell />
        </button>
        <button className="p-2 rounded-full hover:bg-white/10">
          <FiUser />
        </button>
      </div>
    </div>
  );
};
