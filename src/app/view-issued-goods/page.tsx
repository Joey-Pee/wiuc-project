"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Package, AlertCircle, DollarSign } from "lucide-react";

interface IssuedGood {
  id: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  vendor: string;
  createdAt: string;
}

const ViewIssuedGoodsPage = () => {
  const [issuedGoods, setIssuedGoods] = useState<IssuedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    const fetchIssuedGoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/issue-goods");
        if (!response.ok) {
          throw new Error("Failed to fetch issued goods");
        }
        const data = await response.json();
        setIssuedGoods(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchIssuedGoods();
  }, []);

  const filteredGoods = useMemo(() => {
    return issuedGoods.filter((good) => {
      const matchesSearch =
        searchTerm === "" ||
        good.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        good.vendor.toLowerCase().includes(searchTerm.toLowerCase());

      // const matchesCategory =
      //   categoryFilter === "" || good.categoryId === categoryFilter;

      return matchesSearch;
    });
  }, [issuedGoods, searchTerm]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalIssued = issuedGoods.length;
    const totalValue = issuedGoods.reduce(
      (sum, good) => sum + good.totalPrice,
      0
    );
    const uniqueVendors = new Set(issuedGoods.map((good) => good.vendor)).size;
    // const uniqueCategories = new Set(issuedGoods.map((good) => good.categoryId))
    //   .size;

    return {
      totalIssued,
      totalValue,
      uniqueVendors,
      // uniqueCategories,
    };
  }, [issuedGoods]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 pb-5">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto animate-pulse text-blue-500" />
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
            Issued Goods
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View all goods that have been issued to vendors.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Issued
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.totalIssued}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summaryStats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Categories
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.uniqueCategories}
                </p>
              </div>
            </div>
          </div> */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Vendors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryStats.uniqueVendors}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            {/* <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {Array.from(
                new Set(issuedGoods.map((good) => good.categoryId))
              ).map((categoryId) => {
                const category = issuedGoods.find(
                  (good) => good.categoryId === categoryId
                );
                return (
                  <option key={categoryId} value={categoryId}>
                    {category?.categoryName}
                  </option>
                );
              })}
            </select> */}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Price
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Value
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Issue Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGoods.map((good, index) => (
                  <tr
                    key={good.id}
                    className={`${
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {good.itemName}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {good.categoryName}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {good.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {good.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      ${good.totalPrice.toFixed(2) || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {new Date(good.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredGoods.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No issued goods found. Try adjusting your search criteria.
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

export default ViewIssuedGoodsPage;
