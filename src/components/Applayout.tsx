"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/context/themesProvider";
// import { ToastContainer } from "react-toastify";
const NavigationWrapper = dynamic(
  () => import("@/components/NavigationWrapper")
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function Applayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
