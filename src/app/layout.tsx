import { AuthProvider } from "@/hooks/useAuth";
import { PropsWithChildren } from "react";
import "./globals.css";

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body cz-shortcut-listen="true">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
