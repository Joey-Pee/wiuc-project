"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, AlertCircle } from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaCediSign } from "react-icons/fa6";
import { FaReceipt } from "react-icons/fa";

interface Bill {
  id: string;
  vendor: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

const ViewBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/issue-goods");
        if (!response.ok) {
          throw new Error("Failed to fetch issued goods");
        }
        const data = await response.json();
        setBills(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const filteredData = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        searchTerm === "" ||
        bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.itemName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [bills, searchTerm]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalPrice, 0);

    return {
      totalBills,
      totalAmount,
    };
  }, [bills]);

  const columns = useMemo<ColumnDef<Bill>[]>(
    () => [
      {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "itemName",
        header: "Product Name",
        cell: ({ getValue }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date Paid",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          try {
            return (
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            );
          } catch {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }
        },
      },
      {
        accessorKey: "totalPrice",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="text-gray-700 dark:text-gray-300">
            GHS {(getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ getValue }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {getValue() as number}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FaReceipt className="w-12 h-12 mx-auto animate-pulse text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 md:pb-4 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bills
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all bills issued to vendors.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <FaReceipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Bills
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.totalBills}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <FaCediSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  GHS {summaryStats.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by vendor or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-700"
                      } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No bills found. Try adjusting your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillsPage;
