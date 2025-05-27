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
  Truck,
} from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  supplier: string;
  location: string;
  status: "active" | "inactive" | "discontinued";
  lastUpdated: string;
  createdDate: string;
  unit: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
}

interface Category {
  id: string;
  name: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "1", // Beverages
    description: "Premium wireless headphones with noise cancellation",
    price: 199.99,
    costPrice: 120.0,
    quantity: 45,
    minStockLevel: 10,
    maxStockLevel: 100,
    supplier: "TechCorp Solutions",
    location: "Warehouse A - Section 1",
    status: "active",
    lastUpdated: "2024-01-20",
    createdDate: "2023-12-01",
    unit: "pieces",
    weight: 0.3,
    dimensions: "20x15x8 cm",
    barcode: "1234567890123",
  },
  {
    id: "2",
    name: "Gaming Mechanical Keyboard",
    sku: "GMK-002",
    category: "12", // Other
    description: "RGB mechanical keyboard with cherry MX switches",
    price: 149.99,
    costPrice: 85.0,
    quantity: 5,
    minStockLevel: 15,
    maxStockLevel: 50,
    supplier: "Global Supplies Inc",
    location: "Warehouse A - Section 2",
    status: "active",
    lastUpdated: "2024-01-18",
    createdDate: "2023-11-15",
    unit: "pieces",
    weight: 0.8,
    dimensions: "45x15x4 cm",
    barcode: "2345678901234",
  },
  {
    id: "3",
    name: "Office Chair Ergonomic",
    sku: "OCE-003",
    category: "12",
    description: "Comfortable ergonomic office chair with lumbar support",
    price: 299.99,
    costPrice: 180.0,
    quantity: 12,
    minStockLevel: 5,
    maxStockLevel: 25,
    supplier: "Prime Electronics",
    location: "Warehouse B - Section 1",
    status: "active",
    lastUpdated: "2024-01-15",
    createdDate: "2023-10-20",
    unit: "pieces",
    weight: 15.5,
    dimensions: "70x70x120 cm",
  },
  {
    id: "4",
    name: "USB-C Cable 2m",
    sku: "USC-004",
    category: "2", // Bread/Bakery
    description: "High-speed USB-C charging and data cable",
    price: 24.99,
    costPrice: 8.5,
    quantity: 0,
    minStockLevel: 20,
    maxStockLevel: 200,
    supplier: "TechCorp Solutions",
    location: "Warehouse A - Section 3",
    status: "active",
    lastUpdated: "2024-01-22",
    createdDate: "2023-09-10",
    unit: "pieces",
    weight: 0.1,
    dimensions: "200x2x1 cm",
    barcode: "3456789012345",
  },
  {
    id: "5",
    name: "Vintage Desk Lamp",
    sku: "VDL-005",
    category: "12",
    description: "Retro-style desk lamp with adjustable arm",
    price: 89.99,
    costPrice: 45.0,
    quantity: 8,
    minStockLevel: 5,
    maxStockLevel: 30,
    supplier: "Global Supplies Inc",
    location: "Warehouse C - Section 1",
    status: "discontinued",
    lastUpdated: "2024-01-10",
    createdDate: "2023-08-05",
    unit: "pieces",
    weight: 2.2,
    dimensions: "25x25x45 cm",
  },
  {
    id: "6",
    name: "Almond Milk - 1L",
    sku: "DML-006",
    category: "4", // Dairy
    description: "Organic almond milk with no added sugar",
    price: 3.99,
    costPrice: 2.2,
    quantity: 35,
    minStockLevel: 10,
    maxStockLevel: 100,
    supplier: "Green Farms Ltd.",
    location: "Warehouse D - Dairy Section",
    status: "active",
    lastUpdated: "2024-01-25",
    createdDate: "2023-12-10",
    unit: "liters",
    weight: 1,
    dimensions: "7x7x25 cm",
    barcode: "4567890123456",
  },
  {
    id: "7",
    name: "Canned Tuna - 200g",
    sku: "CTN-007",
    category: "3", // Canned/Jarred Goods
    description: "Premium tuna chunks in olive oil",
    price: 2.49,
    costPrice: 1.2,
    quantity: 80,
    minStockLevel: 30,
    maxStockLevel: 200,
    supplier: "Ocean Foods",
    location: "Warehouse B - Shelf 4",
    status: "active",
    lastUpdated: "2024-01-27",
    createdDate: "2023-12-20",
    unit: "cans",
    weight: 0.2,
    dimensions: "8x8x4 cm",
    barcode: "5678901234567",
  },
  {
    id: "8",
    name: "All-Purpose Flour - 2kg",
    sku: "APF-008",
    category: "5", // Dry/Baking Goods
    description: "Fine milled wheat flour for baking and cooking",
    price: 5.99,
    costPrice: 3.0,
    quantity: 120,
    minStockLevel: 50,
    maxStockLevel: 300,
    supplier: "Bakers Choice",
    location: "Warehouse A - Flour Section",
    status: "active",
    lastUpdated: "2024-02-01",
    createdDate: "2024-01-01",
    unit: "kg",
    weight: 2,
    dimensions: "15x10x30 cm",
    barcode: "6789012345678",
  },
  {
    id: "9",
    name: "Frozen Mixed Vegetables - 1kg",
    sku: "FMV-009",
    category: "6", // Frozen Foods
    description: "Carrots, peas, corn, and beans mix",
    price: 4.99,
    costPrice: 2.5,
    quantity: 60,
    minStockLevel: 20,
    maxStockLevel: 150,
    supplier: "FrozenDelights",
    location: "Freezer Room - A1",
    status: "active",
    lastUpdated: "2024-02-02",
    createdDate: "2024-01-03",
    unit: "kg",
    weight: 1,
    dimensions: "20x20x5 cm",
    barcode: "7890123456789",
  },
  {
    id: "10",
    name: "Chicken Breast - 500g",
    sku: "CHB-010",
    category: "7", // Meat
    description: "Boneless, skinless chicken breast",
    price: 6.49,
    costPrice: 3.8,
    quantity: 30,
    minStockLevel: 10,
    maxStockLevel: 80,
    supplier: "Poultry Farms Ltd.",
    location: "Freezer Room - B2",
    status: "active",
    lastUpdated: "2024-02-05",
    createdDate: "2024-01-05",
    unit: "pack",
    weight: 0.5,
    dimensions: "18x12x4 cm",
    barcode: "8901234567890",
  },
  {
    id: "11",
    name: "Toilet Paper - 12 Rolls",
    sku: "TPR-011",
    category: "10", // Paper Goods
    description: "Soft and strong toilet paper rolls",
    price: 9.99,
    costPrice: 5.5,
    quantity: 95,
    minStockLevel: 20,
    maxStockLevel: 150,
    supplier: "CleanSupplies Ltd.",
    location: "Warehouse C - Hygiene",
    status: "active",
    lastUpdated: "2024-02-06",
    createdDate: "2024-01-07",
    unit: "pack",
    weight: 1.5,
    dimensions: "30x25x15 cm",
    barcode: "9012345678901",
  },
  {
    id: "12",
    name: "Hand Sanitizer - 500ml",
    sku: "HSZ-012",
    category: "11", // Personal Care
    description: "Alcohol-based sanitizer with moisturizing effect",
    price: 3.99,
    costPrice: 1.9,
    quantity: 150,
    minStockLevel: 30,
    maxStockLevel: 300,
    supplier: "SafeCare",
    location: "Warehouse D - Shelf 3",
    status: "active",
    lastUpdated: "2024-02-07",
    createdDate: "2024-01-08",
    unit: "bottle",
    weight: 0.5,
    dimensions: "7x7x18 cm",
    barcode: "0123456789012",
  },
];

const vendors = [
  { id: 1, name: "TechCorp Solutions" },
  { id: 2, name: "Global Supplies Inc" },
  { id: 3, name: "Prime Electronics" },
  { id: 4, name: "Quality Distributors" },
  { id: 5, name: "Reliable Suppliers" },
];

type StatusFilter = "all" | "high-stock" | "low-stock" | "out-of-stock";

export default function GoodsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("1");
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

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setCategoriesData(result.data);
        // Set default category to "Beverages" (id: "1")
        setCategoryFilter("1");
        console.log("categories", result.data);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  // Filter products based on search term, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search matching - simplified and more efficient
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.supplier.toLowerCase().includes(searchLower);

      // Category matching
      const matchesCategory = product.category === categoryFilter;

      // Status matching
      let matchesStatus = true;
      switch (statusFilter) {
        case "all":
          matchesStatus = true;
          break;
        case "low-stock":
          matchesStatus =
            product.quantity > 0 && product.quantity <= product.minStockLevel;
          break;
        case "out-of-stock":
          matchesStatus = product.quantity === 0;
          break;
        case "high-stock":
          matchesStatus = product.quantity > product.minStockLevel;
          break;
        default:
          matchesStatus = product.status === statusFilter;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAddProduct = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      description: "",
      price: 0,
      costPrice: 0,
      quantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      supplier: "",
      location: "",
      status: "active",
      unit: "pieces",
    });
    setIsEditing(false);
  };

  const handleEditProduct = (product: Product) => {
    setFormData(product);
    setSelectedProduct(product);
    setIsEditing(true);
    setShowModal(false);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    // setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
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
        lastUpdated: new Date().toISOString().split("T")[0],
      } as Product;

      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
      );
      setShowEditModal(false);
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        grossPrice: calculateGrossPrice(),
        lastUpdated: new Date().toISOString().split("T")[0],
        createdDate: new Date().toISOString().split("T")[0],
      } as Product;
      setProducts([...products, newProduct]);
    }
    setFormData({});
    setSelectedProduct(null);
    setIsEditing(false);
  };

  // Calculate gross price whenever quantity or selling price changes
  const calculateGrossPrice = (): number => {
    const quantity = formData.quantity ?? 0;
    const sellingPrice = formData.price ?? 0;
    return quantity * sellingPrice;
  };

  const getStatusBadge = useCallback((product: Product) => {
    const halfProducts = product.quantity > product.minStockLevel;
    if (product.quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Out of Stock
        </span>
      );
    } else if (product.quantity <= product.minStockLevel) {
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
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.minStockLevel
    ).length;
    const outOfStockProducts = products.filter((p) => p.quantity === 0).length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
    };
  }, [products]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      console.log("searchTerm", value);
    },
    []
  );

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "Product ID",
        // cell: ({ getValue }) => (
        //   <span className="text-sm">#{getValue() as string}</span>
        // ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "costPrice", header: "Cost Price" },
      {
        accessorKey: "price",
        header: "Selling Price",
      },
      { accessorKey: "quantity", header: "Quantity" },
      { accessorKey: "stockLevel", header: "Stock Level" },
    ],
    []
  );

  const table = useReactTable<Product>({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const goodsTable = useMemo(() => {
    return (
      <div className="relative overflow-x-auto rounded-lg ">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-gray-400 dark:text-gray-500 mb-4 block">
              <Package className="w-12 h-12 mx-auto" />
            </span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or add a new product.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            {/* Table Header */}
            <thead className="bg-[#f4f3ee] text-gray-800 dark:bg-gray-800 dark:text-gray-100 font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-3">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody className="text-gray-700 dark:text-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800"
                  } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-center cursor-pointer`}
                  onClick={() => handleViewProduct(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4">
                      {cell.column.id === "stockLevel" ? (
                        <>{getStatusBadge(row.original)}</>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, [table, filteredProducts, getStatusBadge]);

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
                  {summaryStats.totalProducts}
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
                  {summaryStats.lowStockProducts}
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
                  {summaryStats.outOfStockProducts}
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
                  ${summaryStats.totalValue.toLocaleString()}
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="high-stock">High Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            className="flex items-center  gap-2 text-white hover:text-white bg-red-400 dark:bg-red-400 hover:bg-red-500 dark:hover:bg-red-500"
          >
            <MdDelete size={24} />
            <span className="hidden md:block">Delete</span>
          </Button>
        </div>

        {/* Table  for goods */}
        {goodsTable}
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
                          SKU:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.sku}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Category:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        {getStatusBadge(selectedProduct)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Supplier:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.supplier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Location:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.location}
                        </span>
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
                          ${selectedProduct.price}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Selling Price
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${selectedProduct.costPrice}
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
                            selectedProduct.price,
                            selectedProduct.costPrice
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
                            selectedProduct.price,
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SKU *
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.sku || ""}
                        onChange={(e) =>
                          handleInputChange("sku", e.target.value)
                        }
                        readOnly
                        className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                            border-gray-300 dark:border-gray-600`}
                        placeholder="Enter SKU"
                      />
                    </div>
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
                      value={formData.category || ""}
                      onChange={(e) => {
                        handleInputChange("category", e.target.value);
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
                        value={formData.price || ""}
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
                        value={formData.costPrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "costPrice",
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

              {/* Supplier */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Supplier Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Supplier
                    </label>
                    <select
                      value={formData.supplier || ""}
                      onChange={(e) =>
                        handleInputChange("supplier", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select supplier</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
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
