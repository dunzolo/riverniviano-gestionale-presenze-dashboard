"use client";

import { PropsWithChildren } from "react";
import { Section } from "../components/Section";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="min-h-screen h-full bg-primary-700">
      <div className="flex min-h-screen flex-1 flex-col py-5 px-5 relative gap-8">
        <div className="grow flex items-center justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
            <Section.Card className="!p-5">{children}</Section.Card>
          </div>
        </div>
      </div>
    </div>
  );
}
