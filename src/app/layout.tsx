import { AuthProvider } from "@/hooks/useAuth";
import { ValueEnumProvider } from "@/hooks/useValueEnum";
import "@/lib/dayjs";
import { PropsWithChildren } from "react";
import "./globals.css";

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
