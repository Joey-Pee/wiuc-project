"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  sellingPrice: number;
  buyingPrice: number;
  quantity: number;
  status: "active" | "inactive" | "discontinued";
  grossPrice: number;
}

interface Category {
  id: string;
  name: string;
}

interface GroupedProducts {
  [categoryId: string]: {
    category: Category;
    products: Product[];
  };
}

const minStockLevel = 10;

export default function GoodsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [goodsData, setGoodsData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [deleteCategoryItem, setDeleteCategoryItem] = useState(false);

  const fetchCategoriesData = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setCategoriesData(result.data);

      // Only set default category if no category is currently selected
      if (result.data && result.data.length > 0 && !categoryFilter) {
        setCategoryFilter(String(result.data[0].id));
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  }, [categoryFilter]);

  const fetchProductsData = useCallback(async () => {
    try {
      const response = await fetch("/api/goods");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setGoodsData(result.data);
      } else {
        console.error("Invalid data format received:", result);
        setGoodsData([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setGoodsData([]);
    }
  }, []);

  const groupProductsByCategory = useMemo(() => {
    if (goodsData.length === 0 || categoriesData.length === 0) {
      return {};
    }

    const grouped: GroupedProducts = {};

    // Initialize groups for all categories
    categoriesData.forEach((category) => {
      grouped[category.id] = {
        category,
        products: [],
      };
    });

    // Group products by their category ID
    goodsData.forEach((product) => {
      if (grouped[product.categoryId]) {
        grouped[product.categoryId].products.push(product);
      } else {
        console.warn(
          "Category not found for product:",
          product.name,
          "category ID:",
          product.categoryId
        );
      }
    });

    return grouped;
  }, [goodsData, categoriesData]);

  // Update groupedProducts when grouping changes
  useEffect(() => {
    setGroupedProducts(groupProductsByCategory);
  }, [groupProductsByCategory]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategoriesData(), fetchProductsData()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Remove dependencies to avoid infinite loops

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const getStatusBadge = useCallback((product: Product) => {
    const halfProducts = product.quantity > minStockLevel;
    if (product.quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Out of Stock
        </span>
      );
    } else if (product.quantity <= minStockLevel) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Low Stock
        </span>
      );
    } else if (halfProducts) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          High Stock
        </span>
      );
    }
  }, []);

  const getProfitMargin = (price: number, costPrice: number) => {
    if (costPrice === 0) return 0;
    return (((price - costPrice) / costPrice) * 100).toFixed(1);
  };

  const getTotalValue = (price: number, quantity: number) => {
    return (price * quantity).toFixed(2);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalProducts = goodsData.length;
    const lowStockProducts = goodsData.filter(
      (p) => p.quantity > 0 && p.quantity <= minStockLevel
    ).length;
    const outOfStockProducts = goodsData.filter((p) => p.quantity === 0).length;
    const totalValue = goodsData.reduce(
      (sum, p) => sum + p.sellingPrice * p.quantity,
      0
    );

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
    };
  }, [goodsData]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
    },
    []
  );

  // Handle category filter change
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setCategoryFilter(value);
      console.log("Category filter changed to:", value); // Debug log
    },
    []
  );

  const filteredGroupedProducts = useMemo(() => {
    if (Object.keys(groupedProducts).length === 0) {
      return {};
    }

    const filtered: GroupedProducts = {};

    // If a category filter is selected, only process that category
    if (categoryFilter) {
      const categoryData = groupedProducts[categoryFilter];
      if (categoryData) {
        const filteredProducts = categoryData.products.filter((product) => {
          const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          return matchesSearch;
        });

        // Always include the category even if no products match the search
        filtered[categoryFilter] = {
          category: categoryData.category,
          products: filteredProducts,
        };
      }
    } else {
      // If no category filter, process all categories
      Object.entries(groupedProducts).forEach(([categoryId, categoryData]) => {
        const filteredProducts = categoryData.products.filter((product) => {
          const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          return matchesSearch;
        });

        if (filteredProducts.length > 0) {
          filtered[categoryId] = {
            category: categoryData.category,
            products: filteredProducts,
          };
        }
      });
    }

    return filtered;
  }, [groupedProducts, searchTerm, categoryFilter]);

  const renderGroupedProducts = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading products...
          </h3>
        </div>
      );
    }

    // If a category is selected but has no products
    if (categoryFilter && Object.keys(filteredGroupedProducts).length === 0) {
      const selectedCategory = categoriesData.find(
        (cat) => cat.id === categoryFilter
      );
      return (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found in {selectedCategory?.name || "this category"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different category or add new products to this
            category.
          </p>
        </div>
      );
    }

    // Check if selected category has products but they don't match search
    if (
      categoryFilter &&
      filteredGroupedProducts[categoryFilter]?.products.length === 0
    ) {
      const selectedCategory = categoriesData.find(
        (cat) => cat.id === categoryFilter
      );
      return (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products match your search in{" "}
            {selectedCategory?.name || "this category"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or clear the search to see all
            products in this category.
          </p>
        </div>
      );
    }

    // If no products at all
    if (Object.keys(filteredGroupedProducts).length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or add a new product.
          </p>
        </div>
      );
    }

    const groupedData = filteredGroupedProducts;

    return (
      <div className="space-y-8">
        {Object.entries(groupedData).map(([categoryId, categoryData]) => (
          <div
            key={categoryId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {/* Category Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categoryData.category.name}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryData.products.length} product(s)
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              {categoryData.products.length > 0 ? (
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider flex items-center">
                        Cost Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {categoryData.products.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-700"
                        } hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors`}
                        onClick={() => handleViewProduct(product)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">GHS</span>
                            <span>
                              {product.buyingPrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">GHS</span>
                            <span>
                              {product.sellingPrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {product.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No products found in this category matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setDeleteCategoryItem(true);
      const response = await fetch("/api/goods", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: categoryId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Find the category name
      const category = categoriesData.find((cat) => cat.id === categoryId);
      const categoryName = category ? category.name : "Unknown Category";

      // Remove the deleted products from the local state
      setGoodsData((prevData) =>
        prevData.filter((p) => p.categoryId !== categoryId)
      );
      toast.success(`Products deleted from ${categoryName}`);

      // Don't reload the page, just refetch the data
      await fetchProductsData();
    } catch (error) {
      console.error("Error deleting category products:", error);
      toast.error("Failed to delete category products");
    } finally {
      setDeleteCategoryItem(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Goods
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your product inventory and stock levels
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : summaryStats.totalProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : summaryStats.lowStockProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : summaryStats.outOfStockProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading
                    ? "..."
                    : `GHS ${summaryStats.totalValue.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categoriesData.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 text-white hover:text-white bg-red-400 dark:bg-red-400 hover:bg-red-500 dark:hover:bg-red-500"
            onClick={() => {
              if (categoryFilter) {
                handleDeleteCategory(categoryFilter);
              }
            }}
            disabled={!categoryFilter || deleteCategoryItem}
          >
            <MdDelete size={24} />
            <span className="hidden md:block">
              {deleteCategoryItem ? "Deleting..." : "Delete Category Products"}
            </span>
          </Button>
        </div>

        {/* Table for goods */}
        {renderGroupedProducts()}
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Product Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {selectedProduct.name}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        {getStatusBadge(selectedProduct)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Pricing & Stock
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          GHS {selectedProduct.sellingPrice}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Selling Price
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          GHS {selectedProduct.buyingPrice}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Cost Price
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedProduct.quantity}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Current Stock
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {getProfitMargin(
                            selectedProduct.sellingPrice,
                            selectedProduct.buyingPrice
                          )}
                          %
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Profit Percentage/product
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Total Value:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          GHS{" "}
                          {getTotalValue(
                            selectedProduct.sellingPrice,
                            selectedProduct.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
