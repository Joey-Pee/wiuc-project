"use client";
import React, { useState } from "react";
import {
  FaBoxes,
  FaFileInvoiceDollar,
  FaTruckLoading,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdAddShoppingCart, MdStorefront } from "react-icons/md";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "./ThemesToggle";
import { Button } from "./ui/button";
// import { BiCategory } from "react-icons/bi";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/view-vendors",
      label: "VIEW VENDORS",
      icon: <MdStorefront size={20} />,
    },
    // {
    //   href: "/categories",
    //   label: "CATEGORIES",
    //   icon: <BiCategory size={20} />,
    // },
    {
      href: "/add-goods",
      label: "ADD GOODS",
      icon: <MdAddShoppingCart size={20} />,
    },

    {
      href: "/view-goods",
      label: "VIEW GOODS",
      icon: <FaBoxes size={20} />,
    },
    {
      href: "/view-bills",
      label: "VIEW BILLS",
      icon: <FaFileInvoiceDollar size={20} />,
    },
    {
      href: "/issued-goods",
      label: "ISSUED GOODS",
      icon: <FaTruckLoading size={20} />,
    },
    {
      href: "/view-issued-goods",
      label: "VIEW ISSUED GOODS",
      icon: <FaTruckLoading size={20} />,
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full flex justify-center pt-1 bg-gray-50 dark:bg-gray-900">
      <div className="w-[90%] md:w-[97%] lg:w-[90%] bg-[#319b87]  dark:bg-gray-600 rounded">
        {/* Desktop Navigation */}

        <div className="hidden lg:flex items-center justify-center ">
          <div className="hidden lg:flex items-center justify-center p-3">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-1 py-2 px-1 mx-1 rounded text-xs transition-colors duration-200 ${
                  pathname === href
                    ? "bg-[#497970] text-white"
                    : "hover:bg-blue-500 hover:text-white text-white"
                }`}
              >
                <div>{icon}</div>
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex  px-3 justify-end">
            <ModeToggle />
          </div>
        </div>

        {/* Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center justify-between py-3 px-1 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-1 py-2 px-1 rounded text-xs transition-colors duration-200 whitespace-nowrap ${
                  pathname === href
                    ? "bg-[#497970] text-white text-xs"
                    : "hover:bg-blue-500 hover:text-white text-white"
                }`}
              >
                <div>{icon}</div>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {/* Mobile Header with Toggle */}
          <div className="flex items-center justify-between p-3">
            <div className="text-white font-semibold text-lg">Menu</div>

            <div className="flex gap-2 items-center">
              <ModeToggle />

              <Button
                variant="outline"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-white bg-[#497970] hover:bg-[#497970] p-2 rounded transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={20} />
                ) : (
                  <FaBars size={20} />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div
            className={`overflow-hidden transition-all duration-700 ease-in-out ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-3 pb-3 space-y-1">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 p-3 rounded text-sm transition-colors duration-200 ${
                    pathname === href
                      ? "bg-[#497970] text-white"
                      : "hover:bg-blue-500 hover:text-white text-white"
                  }`}
                >
                  <div>{icon}</div>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
