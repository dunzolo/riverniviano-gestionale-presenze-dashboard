import { AuthProvider } from "@/hooks/useAuth";
import { ValueEnumProvider } from "@/hooks/useValueEnum";
import "@/lib/dayjs";
import { Metadata } from "next";
import { PropsWithChildren } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiverNiviano - Portale Allenatori",
  description:
    "RiverNiviano - Portale Allenatori è una piattaforma per la gestione delle presenze.",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body cz-shortcut-listen="true">
        <ValueEnumProvider>
          <AuthProvider>{children}</AuthProvider>
        </ValueEnumProvider>
      </body>
    </html>
  );
}
