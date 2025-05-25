"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Types
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

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
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
    category: "Electronics",
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
    category: "Furniture",
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
    category: "Accessories",
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
    category: "Lighting",
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
];

const categories = [
  "All Categories",
  "Electronics",
  "Furniture",
  "Accessories",
  "Lighting",
  "Office Supplies",
];

export default function GoodsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("All Categories");
  const [statusFilter, setStatusFilter] = useState<
    | "all categories"
    | "active"
    | "inactive"
    | "discontinued"
    | "low-stock"
    | "out-of-stock"
  >("all categories");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All Categories" ||
      product.category === categoryFilter;

    let matchesStatus = true;
    switch (statusFilter) {
      case "all categories":
        matchesStatus = true;
        break;
      case "low-stock":
        matchesStatus =
          product.quantity > 0 && product.quantity <= product.minStockLevel;
        break;
      case "out-of-stock":
        matchesStatus = product.quantity === 0;
        break;
      default:
        matchesStatus = product.status === statusFilter;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAddProduct = () => {
    setFormData({
      name: "",
      sku: "",
      category: "Electronics",
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
    // setShowEditModal(true);
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
        lastUpdated: new Date().toISOString().split("T")[0],
        createdDate: new Date().toISOString().split("T")[0],
      } as Product;
      setProducts([...products, newProduct]);
      setShowAddModal(false);
    }
    setFormData({});
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const getStatusBadge = (product: Product) => {
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
    } else if (product.status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>
      );
    } else if (product.status === "inactive") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Inactive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Discontinued
        </span>
      );
    }
  };

  const getProfitMargin = (price: number, costPrice: number) => {
    if (costPrice === 0) return 0;
    return (((price - costPrice) / costPrice) * 100).toFixed(1);
  };

  const getTotalValue = (price: number, quantity: number) => {
    return (price * quantity).toFixed(2);
  };

  // Calculate summary stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minStockLevel
  ).length;
  const outOfStockProducts = products.filter((p) => p.quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Goods
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your product inventory and stock levels
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lowStockProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {outOfStockProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalValue.toLocaleString()}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    SKU: {product.sku}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.category}
                  </p>
                </div>
                {getStatusBadge(product)}
              </div>

              {/* Price and Stock Info */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Price:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stock:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {product.quantity} {product.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Value:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${getTotalValue(product.price, product.quantity)}
                  </span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Margin:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {getProfitMargin(product.price, product.costPrice)}%
                  </span>
                </div> */}
              </div>

              {/* Stock Level Indicator */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Stock Level</span>
                  <span>
                    {product.quantity}/{product.maxStockLevel}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      product.quantity === 0
                        ? "bg-red-500"
                        : product.quantity <= product.minStockLevel
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (product.quantity / product.maxStockLevel) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                📍 {product.location}
              </p>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewProduct(product)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Package className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or add a new product.
            </p>
          </div>
        )}
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
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Stock Levels
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Minimum:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.minStockLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Maximum:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedProduct.maxStockLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
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
