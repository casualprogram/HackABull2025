// /app/firebase-example/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { uploadData, getAllData, queryData } from "@/lib/firebaseUtils";

// Define item type
interface Item {
  id?: string;
  name: string;
  description: string;
  category: string;
}

export default function FirebaseExample() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Item>({
    name: "",
    description: "",
    category: "",
  });
  const [message, setMessage] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data from a collection
  const fetchData = async () => {
    setLoading(true);
    const result = await getAllData<Item>("items");
    setLoading(false);

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setMessage("Error loading data");
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to upload data
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await uploadData<Item>("items", newItem);

    setLoading(false);
    if (result.success) {
      setMessage(`Item added successfully with ID: ${result.id}`);
      setNewItem({ name: "", description: "", category: "" });
      fetchData(); // Refresh the list
    } else {
      setMessage("Error adding item");
    }
  };

  // Example function to get data by category
  const handleFilterByCategory = async (category: string) => {
    setLoading(true);
    const result = await queryData<Item>("items", "category", "==", category);
    setLoading(false);

    if (result.success && result.data) {
      setData(result.data);
      setMessage(`Showing items in category: ${category}`);
    } else {
      setMessage("Error filtering data");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Firebase Example</h1>

      {/* Form to add new data */}
      <div className="mb-8 rounded border p-4">
        <h2 className="mb-4 text-xl">Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block">Name</label>
            <input
              type="text"
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block">Description</label>
            <textarea
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block">Category</label>
            <input
              type="text"
              name="category"
              value={newItem.category}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Item"}
          </button>
        </form>
      </div>

      {/* Status message */}
      {message && <div className="my-4 rounded bg-gray-100 p-3">{message}</div>}

      {/* Filter buttons */}
      <div className="my-4">
        <button
          onClick={fetchData}
          className="mr-2 rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          type="button"
        >
          All Items
        </button>
        <button
          onClick={() => handleFilterByCategory("electronics")}
          className="mr-2 rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          type="button"
        >
          Electronics
        </button>
        <button
          onClick={() => handleFilterByCategory("books")}
          className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
          type="button"
        >
          Books
        </button>
      </div>

      {/* Data display */}
      <div>
        <h2 className="mb-4 text-xl">Items List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : data.length > 0 ? (
          <ul className="space-y-4">
            {data.map((item) => (
              <li key={item.id} className="rounded border p-3">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                  {item.category}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items found</p>
        )}
      </div>
    </div>
  );
}
