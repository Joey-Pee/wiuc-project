"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

const NavigationWrapper = () => {
  const [isSticky, setIsSticky] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login") {
    return <div></div>;
  }

  return (
    <>
      <div
        className={`z-50 w-full transition-all duration-300 ${
          isSticky ? "fixed top-0" : "relative"
        }`}
      >
        <Navbar />
      </div>
    </>
  );
};

export default NavigationWrapper;
