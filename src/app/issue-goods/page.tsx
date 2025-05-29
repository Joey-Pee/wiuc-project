"use client";

import { AlertCircle, Package } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";

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

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
}

const Page = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState<{
    categoryId: string;
    productId: string;
    quantity: number;
    sellingPrice: number;
    vendorId: string;
    grossPrice: number;
  }>({
    categoryId: "",
    productId: "",
    quantity: 0,
    sellingPrice: 0,
    vendorId: "",
    grossPrice: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data);

        // Fetch products
        const productsResponse = await fetch("/api/goods");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.data);

        // Fetch vendors
        const vendorsResponse = await fetch("/api/vendors");
        if (!vendorsResponse.ok) {
          throw new Error("Failed to fetch vendors");
        }
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!formData.categoryId) return [];
    return products.filter(
      (product) => product.categoryId === formData.categoryId
    );
  }, [formData.categoryId, products]);

  // Get selected product details
  const selectedProduct = useMemo(() => {
    if (!formData.productId) return null;
    return (
      products.find((product) => product.id === formData.productId) || null
    );
  }, [formData.productId, products]);

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId,
      productId: "", // Reset product selection when category changes
      sellingPrice: 0, // Reset price
    }));

    // Clear errors
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setFormData((prev) => ({
      ...prev,
      productId,
      sellingPrice: product ? product.sellingPrice : 0,
      grossPrice: product ? product.sellingPrice * prev.quantity : 0,
    }));

    // Clear errors
    if (errors.productId) {
      setErrors((prev) => ({ ...prev, productId: "" }));
    }
  };

  const handleVendorChange = (vendorId: string) => {
    setFormData((prev) => ({
      ...prev,
      vendorId,
    }));

    // Clear errors
    if (errors.vendorId) {
      setErrors((prev) => ({ ...prev, vendorId: "" }));
    }
  };

  const handleQuantityChange = (quantity: string) => {
    const newQuantity = parseInt(quantity) || 0;
    const maxQuantity = selectedProduct?.quantity || 0;

    // Ensure the quantity doesn't exceed available stock
    const validQuantity = Math.min(newQuantity, maxQuantity);

    setFormData((prev) => ({
      ...prev,
      quantity: validQuantity,
      grossPrice: validQuantity * prev.sellingPrice,
    }));

    // Clear errors
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: "" }));
    }
  };

  const handleCancel = () => {
    setFormData({
      categoryId: "",
      productId: "",
      quantity: 0,
      sellingPrice: 0,
      vendorId: "",
      grossPrice: 0,
    });
    setErrors({});
  };

  const handleIssueGoods = async () => {
    try {
      const response = await fetch("/api/issue-goods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to issue goods");
      }

      const data = await response.json();
      console.log("Issue Goods Response:", data);

      // Reset form after successful submission
      handleCancel();

      // Show success message (you can implement this based on your UI needs)
      alert("Goods issued successfully!");
    } catch (error) {
      console.error("Error issuing goods:", error);
      alert(error instanceof Error ? error.message : "Failed to issue goods");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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
                    value={formData.categoryId}
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
                    disabled={!formData.categoryId}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
                      errors.productId
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      {formData.categoryId
                        ? "Select Product"
                        : "Select category first"}
                    </option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
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
                    Vendor *
                  </label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => handleVendorChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.vendorId
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.vendorId}
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
                    max={selectedProduct?.quantity || 0}
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
                      Available: {selectedProduct.quantity} units
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
                    value={formData.sellingPrice.toFixed(2)}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Auto-filled from product
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Value
                  </label>
                  <input
                    type="number"
                    value={formData.grossPrice.toFixed(2)}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Calculated (Price × Quantity)
                  </p>
                </div>
              </div>

              {selectedProduct && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Selected Product Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Product Name:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        {selectedProduct.name}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Quantity:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        {formData.quantity} units
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        Unit Price:
                      </span>
                      <span className="ml-2 text-blue-700 dark:text-blue-300">
                        ${selectedProduct.sellingPrice.toFixed(2)}
                      </span>
                    </div>

                    {formData.vendorId && (
                      <>
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            Selected Vendor:
                          </span>
                          <span className="ml-2 text-blue-700 dark:text-blue-300">
                            {
                              vendors.find((v) => v.id === formData.vendorId)
                                ?.name
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            Contact Person:
                          </span>
                          <span className="ml-2 text-blue-700 dark:text-blue-300">
                            {
                              vendors.find((v) => v.id === formData.vendorId)
                                ?.contactPerson
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            Vendor Contact:
                          </span>
                          <span className="ml-2 text-blue-700 dark:text-blue-300">
                            {
                              vendors.find((v) => v.id === formData.vendorId)
                                ?.phone
                            }
                          </span>
                        </div>
                      </>
                    )}
                    {formData.quantity > 0 && (
                      <div>
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          Total Value:
                        </span>
                        <span className="ml-2 text-blue-700 dark:text-blue-300">
                          ${formData.grossPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssueGoods}
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
