"use client";

import { Input } from "@heroui/react";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ onSearch, initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Input
        isClearable
        type="text"
        placeholder="Search stories by title or subject..."
        value={searchTerm}
        onValueChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
        startContent={<FaSearch className="text-gray-600" />}
        size="md"
        className="w-full"
        classNames={{
          input: "text-sm",
          inputWrapper: "h-10",
        }}
      />
    </div>
  );
}
