import { AuthProvider } from "@/hooks/useAuth";
import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";
import "./globals.css";

export const defaultFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter", // opzionale: per usare come variabile CSS
});

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
