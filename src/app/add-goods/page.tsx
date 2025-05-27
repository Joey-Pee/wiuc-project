"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Plus,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id?: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  supplier: string;
  createdDate: number;
  grossPrice: number;
}

// const categories = [
//   { id: "1", name: "Beverages" },
//   { id: "2", name: "Bread/Bakery" },
//   { id: "3", name: "Canned/Jarred Goods" },
//   { id: "4", name: "Dairy" },
//   { id: "5", name: "Dry/Baking Goods" },
//   { id: "6", name: "Frozen Foods" },
//   { id: "7", name: "Meat" },
//   { id: "8", name: "Produce" },
//   { id: "9", name: "Cleaners" },
//   { id: "10", name: "Paper Goods" },
//   { id: "11", name: "Personal Care" },
//   { id: "12", name: "Other" },
// ];

const vendors = [
  { id: 1, name: "TechCorp Solutions" },
  { id: 2, name: "Global Supplies Inc" },
  { id: 3, name: "Prime Electronics" },
  { id: 4, name: "Quality Distributors" },
  { id: 5, name: "Reliable Suppliers" },
];

interface Category {
  id: string;
  name: string;
}

const AddProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    description: "",
    category: "",
    sellingPrice: 0,
    costPrice: 0,
    quantity: 0,
    supplier: "",
    grossPrice: 0,
    createdDate: new Date().getTime(),
    // createdDate: new Date().toISOString().split("T")[0],
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setCategoriesData(result.data);

        console.log("categories", result.data);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
      }
    };

    fetchCategoriesData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      sellingPrice: 0,
      costPrice: 0,
      quantity: 0,
      supplier: "",
      grossPrice: 0,
      createdDate: new Date().getTime(),
    });
    setErrors({});
  };

  const addNewForm = () => {
    // Save current form data to products array
    if (validateForm()) {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
      } as Product;

      setProducts((prev) => [...prev, newProduct]);
      resetForm();
      setCurrentFormIndex((prev) => prev + 1);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.sku?.trim()) {
      newErrors.sku = "SKU is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      newErrors.sellingPrice = "Selling price must be greater than 0";
    }
    if (!formData.costPrice || formData.costPrice <= 0) {
      newErrors.costPrice = "Cost price must be greater than 0";
    }
    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate gross price whenever quantity or selling price changes
  const calculateGrossPrice = (): number => {
    const quantity = formData.quantity ?? 0;
    const sellingPrice = formData.sellingPrice ?? 0;
    return quantity * sellingPrice;
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Add the current form data to products
    const newProduct: Product = {
      ...formData,
      id: Date.now().toString(),
      grossPrice: calculateGrossPrice(),
    } as Product;

    const allProducts = [...products, newProduct];

    // Here you would typically send allProducts to your API
    console.log("Saving all products:", allProducts);

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Reset everything
    setProducts([]);
    setCurrentFormIndex(0);
    resetForm();
  };

  const handleInputChange = (
    field: keyof Product | string,
    value: string | number | boolean | { name: string; id: string }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: `PRD-${timestamp}-${random}` }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 md:pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Products
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create new product entries with all the necessary details
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Products saved successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        {products.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Products to be saved ({products.length})
            </h2>
            <div className="space-y-2">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setProducts((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSaveAll} className="p-6 space-y-6">
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
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.sku || ""}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.sku
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter SKU"
                    />
                    <Button
                      type="button"
                      onClick={generateSKU}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.sku}
                    </p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.category
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categoriesData.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
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
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.sellingPrice
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.sellingPrice}
                    </p>
                  )}
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
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.costPrice
                          ? "border-red-500 dark:border-red-400"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.costPrice && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.costPrice}
                    </p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.quantity
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.quantity}
                    </p>
                  )}
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
            <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={addNewForm}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Plus className="w-5 h-5 md:mr-2" />
                <span className="hidden md:block">Add New</span>
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Save className="w-5 h-5 md:mr-2" />
                <span className="hidden md:block">Save All Products</span>
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 md:mr-2" />
                <span className="hidden md:block">Reset Form</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
