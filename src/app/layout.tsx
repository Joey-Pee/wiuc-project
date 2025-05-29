import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/context/themesProvider";
import { ToastContainer } from "react-toastify";
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
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
