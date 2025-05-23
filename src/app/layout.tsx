import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/context/themesProvider";
const NavigationWrapper = dynamic(
  () => import("@/components/NavigationWrapper")
);

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
    <html lang="en">
      <body>
        <ThemeProvider>
          <nav>
            <NavigationWrapper />
          </nav>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
