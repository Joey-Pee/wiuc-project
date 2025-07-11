import type { Metadata } from "next";
import "./globals.css";
import Applayout from "@/components/Applayout";

export const metadata: Metadata = {
  title: "Inventory Project",
  description: "WICU Group Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Applayout>{children}</Applayout>
      </body>
    </html>
  );
}
