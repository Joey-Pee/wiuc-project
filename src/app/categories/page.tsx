"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  Archive,
  TrendingUp,
  Package,
  Eye,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: "active" | "inactive";
  createdDate: string;
  lastUpdated: string;
  color: string;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    description:
      "Electronic devices and gadgets including phones, computers, and accessories",
    productCount: 15,
    status: "active",
    createdDate: "2023-08-01",
    lastUpdated: "2024-01-20",
    color: "#3B82F6", // Blue
  },
  {
    id: "2",
    name: "Furniture",
    description: "Office and home furniture items",
    productCount: 8,
    status: "active",
    createdDate: "2023-09-15",
    lastUpdated: "2024-01-18",
    color: "#10B981", // Green
  },
  {
    id: "3",
    name: "Accessories",
    description: "Various accessories and small items",
    productCount: 12,
    status: "active",
    createdDate: "2023-07-20",
    lastUpdated: "2024-01-15",
    color: "#F59E0B", // Yellow
  },
  {
    id: "4",
    name: "Lighting",
    description: "Lighting fixtures and equipment",
    productCount: 5,
    status: "active",
    createdDate: "2023-10-05",
    lastUpdated: "2024-01-10",
    color: "#EF4444", // Red
  },
  {
    id: "5",
    name: "Office Supplies",
    description: "Office supplies and stationery items",
    productCount: 0,
    status: "inactive",
    createdDate: "2023-06-10",
    lastUpdated: "2023-12-05",
    color: "#8B5CF6", // Purple
  },
];

const categoryColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    color: categoryColors[0],
    status: "active",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Filter categories based on search term and status
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        category.name.toLowerCase().includes(searchLower) ||
        category.description.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleAddCategory = () => {
    setFormData({
      name: "",
      description: "",
      color: categoryColors[0],
      status: "active",
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData(category);
    setSelectedCategory(category);
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = () => {
    if (isEditing && selectedCategory) {
      // Update existing category
      const updatedCategory = {
        ...selectedCategory,
        ...formData,
        lastUpdated: new Date().toISOString().split("T")[0],
      } as Category;

      setCategories(
        categories.map((c) =>
          c.id === selectedCategory.id ? updatedCategory : c
        )
      );
      setShowEditModal(false);
    } else {
      // Add new category
      const newCategory: Category = {
        ...formData,
        id: Date.now().toString(),
        productCount: 0,
        createdDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      } as Category;
      setCategories([...categories, newCategory]);
      setShowAddModal(false);
    }
    setFormData({
      name: "",
      description: "",
      color: categoryColors[0],
      status: "active",
    });
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const getStatusBadge = useCallback((status: string) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Inactive
        </span>
      );
    }
  }, []);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(
      (c) => c.status === "active"
    ).length;
    const inactiveCategories = categories.filter(
      (c) => c.status === "inactive"
    ).length;
    const totalProducts = categories.reduce(
      (sum, c) => sum + c.productCount,
      0
    );

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalProducts,
    };
  }, [categories]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleFormChange = (field: keyof Category, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Category Management
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Organize and manage your product categories
          </p>
        </div>

        {/* Category Detail Modal */}
        {showModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Category Details
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

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-4"
                      style={{ backgroundColor: selectedCategory.color }}
                    ></div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedCategory.name}
                    </h3>
                    <div className="ml-auto">
                      {getStatusBadge(selectedCategory.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCategory.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedCategory.productCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Products
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(
                          selectedCategory.createdDate
                        ).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Created Date
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditCategory(selectedCategory)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Edit Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleFormChange("color", color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            formData.color === color
                              ? "border-gray-900 dark:border-white scale-110"
                              : "border-gray-300 dark:border-gray-600 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) =>
                        handleFormChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {isEditing ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Category
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "{categoryToDelete.name}"?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Categories
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalCategories}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Categories
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.activeCategories}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <div className="flex items-center">
            <Archive className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Categories
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.inactiveCategories}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 md:p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
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
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Add Category Button */}
        <button
          onClick={handleAddCategory}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <span className="text-gray-400 dark:text-gray-500 mb-4 block">
              <Tag className="w-12 h-12 mx-auto" />
            </span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or add a new category.
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                {getStatusBadge(category.status)}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {category.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.productCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Products
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Created
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(category.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewCategory(category)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
