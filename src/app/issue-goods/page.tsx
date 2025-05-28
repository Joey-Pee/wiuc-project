"use client";

import { AlertCircle, Package } from "lucide-react";
import React, { useState, useMemo } from "react";

interface Product {
  id?: string;
  productName: string;
  sku: string;
  description: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  supplier: string;
  createdDate: number;
  grossPrice: number;
  price?: number; // Added to handle the price field in mockProducts
}

const mockProducts: Product[] = [
  {
    id: "1",
    productName: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "1", // Beverages
    description: "Premium wireless headphones with noise cancellation",
    price: 199.99,
    sellingPrice: 199.99,
    costPrice: 120.0,
    quantity: 45,
    supplier: "TechCorp Solutions",
    createdDate: Date.now(),
    grossPrice: 199.99,
  },
  {
    id: "2",
    productName: "Gaming Mechanical Keyboard",
    sku: "GMK-002",
    category: "12", // Other
    description: "RGB mechanical keyboard with cherry MX switches",
    price: 149.99,
    sellingPrice: 149.99,
    costPrice: 85.0,
    quantity: 5,
    supplier: "Global Supplies Inc",
    createdDate: Date.now(),
    grossPrice: 149.99,
  },
  {
    id: "3",
    productName: "Office Chair Ergonomic",
    sku: "OCE-003",
    category: "12",
    description: "Comfortable ergonomic office chair with lumbar support",
    price: 299.99,
    sellingPrice: 299.99,
    costPrice: 180.0,
    quantity: 12,
    supplier: "Prime Electronics",
    createdDate: Date.now(),
    grossPrice: 299.99,
  },
  {
    id: "4",
    productName: "USB-C Cable 2m",
    sku: "USC-004",
    category: "2", // Bread/Bakery
    description: "High-speed USB-C charging and data cable",
    price: 24.99,
    sellingPrice: 24.99,
    costPrice: 8.5,
    quantity: 0,
    supplier: "TechCorp Solutions",
    createdDate: Date.now(),
    grossPrice: 24.99,
  },
  {
    id: "5",
    productName: "Vintage Desk Lamp",
    sku: "VDL-005",
    category: "12",
    description: "Retro-style desk lamp with adjustable arm",
    price: 89.99,
    sellingPrice: 89.99,
    costPrice: 45.0,
    quantity: 8,
    supplier: "Global Supplies Inc",
    createdDate: Date.now(),
    grossPrice: 89.99,
  },
  {
    id: "6",
    productName: "Almond Milk - 1L",
    sku: "DML-006",
    category: "4", // Dairy
    description: "Organic almond milk with no added sugar",
    price: 3.99,
    sellingPrice: 3.99,
    costPrice: 2.2,
    quantity: 35,
    supplier: "Green Farms Ltd.",
    createdDate: Date.now(),
    grossPrice: 3.99,
  },
  {
    id: "7",
    productName: "Canned Tuna - 200g",
    sku: "CTN-007",
    category: "3", // Canned/Jarred Goods
    description: "Premium tuna chunks in olive oil",
    price: 2.49,
    sellingPrice: 2.49,
    costPrice: 1.2,
    quantity: 80,
    supplier: "Ocean Foods",
    createdDate: Date.now(),
    grossPrice: 2.49,
  },
  {
    id: "8",
    productName: "All-Purpose Flour - 2kg",
    sku: "APF-008",
    category: "5", // Dry/Baking Goods
    description: "Fine milled wheat flour for baking and cooking",
    price: 5.99,
    sellingPrice: 5.99,
    costPrice: 3.0,
    quantity: 120,
    supplier: "Bakers Choice",
    createdDate: Date.now(),
    grossPrice: 5.99,
  },
];

const categories = [
  { id: "1", name: "Beverages" },
  { id: "2", name: "Bread/Bakery" },
  { id: "3", name: "Canned/Jarred Goods" },
  { id: "4", name: "Dairy" },
  { id: "5", name: "Dry/Baking Goods" },
  { id: "6", name: "Frozen Foods" },
  { id: "7", name: "Meat" },
  { id: "8", name: "Produce" },
  { id: "9", name: "Cleaners" },
  { id: "10", name: "Paper Goods" },
  { id: "11", name: "Personal Care" },
  { id: "12", name: "Other" },
];

const Page = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    category: string;
    productId: string;
    quantity: number;
    price: number;
  }>({
    category: "",
    productId: "",
    quantity: 0,
    price: 0,
  });

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!formData.category) return [];
    return mockProducts.filter(
      (product) => product.category === formData.category
    );
  }, [formData.category]);

  // Get selected product details
  const selectedProduct = useMemo(() => {
    if (!formData.productId) return null;
    return (
      mockProducts.find((product) => product.id === formData.productId) || null
    );
  }, [formData.productId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.productId) {
      newErrors.productId = "Product is required";
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      productId: "", // Reset product selection when category changes
      price: 0, // Reset price
    }));

    // Clear errors
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleProductChange = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      productId,
      price: product ? product.price || product.sellingPrice : 0,
    }));

    // Clear errors
    if (errors.productId) {
      setErrors((prev) => ({ ...prev, productId: "" }));
    }
  };

  const handleQuantityChange = (quantity: string) => {
    setFormData((prev) => ({
      ...prev,
      quantity: parseInt(quantity) || 0,
    }));

    // Clear errors
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: "" }));
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 md:pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Issue Goods
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Issue goods with recipient, quantity, and date to keep inventory
            accurate.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.category
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
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
                    Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    disabled={!formData.category}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                      errors.productId
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      {formData.category
                        ? "Select Product"
                        : "Select category first"}
                    </option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.productName} (Stock: {product.quantity})
                      </option>
                    ))}
                  </select>
                  {errors.productId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.productId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity}
                    value={formData.quantity || ""}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.quantity
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter quantity"
                  />
                  {selectedProduct && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Available: {selectedProduct.quantity}
                    </p>
                  )}
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={formData.price.toFixed(2)}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Auto-filled from product
                  </p>
                </div>
              </div>

              {selectedProduct && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Selected Product Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        SKU:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        {selectedProduct.sku}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Supplier:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        {selectedProduct.supplier}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Total Value:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        ${(formData.price * formData.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) {
                    alert(
                      `Form is valid! Issuing ${formData.quantity} units of ${
                        selectedProduct?.productName
                      } for $${(formData.price * formData.quantity).toFixed(2)}`
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Issue Goods
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
