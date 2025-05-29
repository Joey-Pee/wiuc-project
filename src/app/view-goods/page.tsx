"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Save,
  Tag,
  DollarSign,
} from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  // flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  categoryId: string; // This represents the category ID
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

type StatusFilter = "all" | "high-stock" | "low-stock" | "out-of-stock";

const minStockLevel = 10;
const maxStockLevel = 20;

let goodsData: Product[] = [];

export default function GoodsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "high-stock" | "low-stock" | "out-of-stock"
  >("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});

  useEffect(() => {
    Promise.all([fetchCategoriesData(), fetchProductsData()]).then(() => {
      groupProductsByCategory();
    });
  }, []);

  const fetchCategoriesData = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setCategoriesData(result.data);

      if (result.data && result.data.length > 0) {
        setCategoryFilter(String(result.data[0].id));
      }
      // console.log("categories", result.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsData = async () => {
    try {
      const response = await fetch("/api/goods");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("API Response:", result);

      if (result.data && Array.isArray(result.data)) {
        goodsData = result.data;
        console.log("Updated goodsData:", goodsData);
        // Trigger regrouping after data is updated
        groupProductsByCategory();
      } else {
        console.error("Invalid data format received:", result);
        goodsData = [];
        setGroupedProducts({});
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      goodsData = [];
      setGroupedProducts({});
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData(product);
    setSelectedProduct(product);
    setIsEditing(true);
    setShowModal(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/goods/${product.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the deleted product from the local state
      goodsData = goodsData.filter((p) => p.id !== product.id);
      // Refresh the grouped products
      groupProductsByCategory();

      // Show success message or handle UI feedback
      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      // Handle error (show error message to user)
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      goodsData = goodsData.filter((p) => p.id !== productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleInputChange = (
    field: keyof Product,
    value: string | number | boolean | { name: string; id: string }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = () => {
    if (isEditing && selectedProduct) {
      // Update existing product
      const updatedProduct = {
        ...selectedProduct,
        ...formData,
      } as Product;

      goodsData = goodsData.map((p) =>
        p.id === selectedProduct.id ? updatedProduct : p
      );
      setShowEditModal(false);
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData,
        grossPrice: calculateGrossPrice(),
      } as Product;
      goodsData = [...goodsData, newProduct];
    }
    setFormData({});
    setSelectedProduct(null);
    setIsEditing(false);
  };

  // Calculate gross price whenever quantity or selling price changes
  const calculateGrossPrice = (): number => {
    const quantity = formData.quantity ?? 0;
    const sellingPrice = formData.sellingPrice ?? 0;
    return quantity * sellingPrice;
  };

  const groupProductsByCategory = useCallback(() => {
    console.log("Grouping products...");
    console.log("goodsData:", goodsData);
    console.log("categoriesData:", categoriesData);

    if (goodsData.length === 0 || categoriesData.length === 0) {
      console.log(
        "No data to group - goodsData length:",
        goodsData.length,
        "categoriesData length:",
        categoriesData.length
      );
      setGroupedProducts({});
      return;
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
      console.log(
        "Processing product:",
        product.name,
        "with category ID:",
        product.categoryId
      );
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

    console.log("Final grouped products:", grouped);
    setGroupedProducts(grouped);
  }, [categoriesData]);

  useEffect(() => {
    groupProductsByCategory();
  }, [goodsData, categoriesData, groupProductsByCategory]);

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
      console.log("searchTerm", value);
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

          let matchesStatus = true;
          if (statusFilter !== "all") {
            switch (statusFilter) {
              case "high-stock":
                matchesStatus = product.quantity > minStockLevel;
                break;
              case "low-stock":
                matchesStatus =
                  product.quantity > 0 && product.quantity <= minStockLevel;
                break;
              case "out-of-stock":
                matchesStatus = product.quantity === 0;
                break;
            }
          }

          return matchesSearch && matchesStatus;
        });

        if (filteredProducts.length > 0) {
          filtered[categoryFilter] = {
            category: categoryData.category,
            products: filteredProducts,
          };
        }
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

          let matchesStatus = true;
          if (statusFilter !== "all") {
            switch (statusFilter) {
              case "high-stock":
                matchesStatus = product.quantity > minStockLevel;
                break;
              case "low-stock":
                matchesStatus =
                  product.quantity > 0 && product.quantity <= minStockLevel;
                break;
              case "out-of-stock":
                matchesStatus = product.quantity === 0;
                break;
            }
          }

          return matchesSearch && matchesStatus;
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
  }, [groupedProducts, searchTerm, categoryFilter, statusFilter]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <span className="font-medium">{(getValue() as string) || "-"}</span>
        ),
      },
      {
        accessorKey: "buyingPrice",
        header: "Cost Price",
        cell: ({ getValue }) => (
          <span className="">${((getValue() as number) || 0).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "sellingPrice",
        header: "Selling Price",
        cell: ({ getValue }) => (
          <span className="">${((getValue() as number) || 0).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ getValue }) => (
          <span className="">{(getValue() as number) || 0}</span>
        ),
      },
      {
        accessorKey: "stockLevel",
        header: "Stock Level",
        cell: ({ row }) => getStatusBadge(row.original),
      },
    ],
    [getStatusBadge]
  );

  const table = useReactTable<Product>({
    data: goodsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                        ${product.buyingPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        ${product.sellingPrice?.toFixed(2) || "0.00"}
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
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch("/api/goods/delete-category", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the deleted products from the local state
      goodsData = goodsData.filter((p) => p.categoryId !== categoryId);
      // Refresh the grouped products
      groupProductsByCategory();

      console.log("Category products deleted successfully");
    } catch (error) {
      console.error("Error deleting category products:", error);
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
                    : `$${summaryStats.totalValue.toLocaleString()}`}
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
                onChange={(e) => setCategoryFilter(e.target.value)}
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
          >
            <MdDelete size={24} />
            <span className="hidden md:block">Delete Category Products</span>
          </Button>
        </div>

        {/* Table  for goods */}
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
                          Category:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.categoryId}
                        </span>
                      </div>
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
                          ${selectedProduct.sellingPrice}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Selling Price
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${selectedProduct.buyingPrice}
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
                          Profit Margin
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
                          $
                          {getTotalValue(
                            selectedProduct.sellingPrice,
                            selectedProduct.quantity
                          )}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2  px-4 py-2 hover:text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                          onClick={() => handleEditProduct(selectedProduct)}
                        >
                          <FaEdit />
                          <span className="hidden md:block"> Edit</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product */}

      {isEditing && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className=" bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                          border-gray-300 dark:border-gray-600
                      `}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>

              {/* Category and Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Category & Pricing
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId || ""}
                      onChange={(e) => {
                        handleInputChange("categoryId", e.target.value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600`}
                    >
                      <option value="">Select category</option>
                      {categoriesData.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selling Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.sellingPrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "sellingPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cost Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.buyingPrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "buyingPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventory
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600`}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gross Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={`${calculateGrossPrice().toFixed(2)}`}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-gray-400 hover:bg-gray-500 dark:bg-gray-400 dark:hover:bg-gray-500 text-white font-medium rounded-lg transition-colors duration-200"
                  onClick={() => setShowEditModal(false)}
                >
                  <Save className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:block">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Save className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:block">Update Product</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
