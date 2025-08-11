"use client";

import { ProAntProvider } from "@/providers/ProAntProvider";
import { PropsWithChildren } from "react";
import { Section } from "../../components/Section";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  const theme = {
    primary: "var(--color-primary-default)",
    primaryHover: "var(--color-primary-400)",
    primaryActive: "var(--color-primary-600)",
    siderBackground: "var(--color-primary-dark)",
    siderCollapsedBackground: "var(--color-primary-default)",
    siderMenuActive: "rgba(255,255,255,0.15)",
    siderTextColor: "#FFFFFF",
  };

  return (
    <ProAntProvider theme={theme}>
      <div className="min-h-screen h-full bg-primary-700">
        <div className="flex min-h-screen flex-1 flex-col py-5 px-5 relative gap-8">
          <div className="grow flex items-center justify-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
              <Section.Card className="!p-5">{children}</Section.Card>
            </div>
          </div>
        </div>
      </div>
    </ProAntProvider>
  );
}
