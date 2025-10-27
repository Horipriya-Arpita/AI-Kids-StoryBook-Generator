"use client";

import { Select, SelectItem, Divider, Button } from "@heroui/react";
import { FaFilter, FaTimes } from "react-icons/fa";

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const storyTypes = [
    { value: "", label: "All Types" },
    { value: "Story Book", label: "Story Book" },
    { value: "Bed Story", label: "Bed Story" },
    { value: "Educational Story", label: "Educational Story" },
  ];

  const ageGroups = [
    { value: "", label: "All Ages" },
    { value: "0-2 Years", label: "0-2 Years" },
    { value: "3-5 Years", label: "3-5 Years" },
    { value: "5-8 Years", label: "5-8 Years" },
  ];

  const imageStyles = [
    { value: "", label: "All Styles" },
    { value: "3D Cartoon", label: "3D Cartoon" },
    { value: "Paper Cut", label: "Paper Cut" },
    { value: "Water Color", label: "Water Color" },
    { value: "Pixel Style", label: "Pixel Style" },
  ];

  const privacyOptions = [
    { value: "all", label: "All Stories" },
    { value: "public", label: "Public Only" },
    { value: "myStories", label: "My Stories" },
    { value: "favorites", label: "My Favorites" },
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "popular", label: "Most Popular" },
    { value: "trending", label: "Trending" },
    { value: "mostViewed", label: "Most Viewed" },
    { value: "topRated", label: "Top Rated" },
  ];

  const hasActiveFilters =
    filters.storyType ||
    filters.ageGroup ||
    filters.imageType ||
    filters.privacy !== "all" ||
    filters.sortBy !== "recent";

  return (
    <div className="w-full lg:w-72 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-primary text-sm" />
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<FaTimes />}
            onPress={onClearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {/* Privacy Filter */}
        <div>
          <div className="text-sm font-semibold mb-2">Privacy:</div>
          <Select
            placeholder="Select privacy"
            selectedKeys={[filters.privacy]}
            onChange={(e) => onFilterChange("privacy", e.target.value)}
            className="w-full"
            size="sm"
            classNames={{
              trigger: "h-10",
              value: "text-sm",
            }}
          >
            {privacyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Divider className="my-2" />

        {/* Story Type Filter */}
        <div>
          <div className="text-sm font-semibold mb-2">Story Type:</div>
          <Select
            placeholder="Select story type"
            selectedKeys={filters.storyType ? [filters.storyType] : [""]}
            onChange={(e) => onFilterChange("storyType", e.target.value)}
            className="w-full"
            size="sm"
            classNames={{
              trigger: "h-10",
              value: "text-sm",
            }}
          >
            {storyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Age Group Filter */}
        <div>
          <div className="text-sm font-semibold mb-2">Age Group:</div>
          <Select
            placeholder="Select age group"
            selectedKeys={filters.ageGroup ? [filters.ageGroup] : [""]}
            onChange={(e) => onFilterChange("ageGroup", e.target.value)}
            className="w-full"
            size="sm"
            classNames={{
              trigger: "h-10",
              value: "text-sm",
            }}
          >
            {ageGroups.map((age) => (
              <SelectItem key={age.value} value={age.value}>
                {age.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Image Style Filter */}
        <div>
          <div className="text-sm font-semibold mb-2">Image Style:</div>
          <Select
            placeholder="Select image style"
            selectedKeys={filters.imageType ? [filters.imageType] : [""]}
            onChange={(e) => onFilterChange("imageType", e.target.value)}
            className="w-full"
            size="sm"
            classNames={{
              trigger: "h-10",
              value: "text-sm",
            }}
          >
            {imageStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Divider className="my-2" />

        {/* Sort By */}
        <div>
          <div className="text-sm font-semibold mb-2">Sort By:</div>
          <Select
            placeholder="Select sort option"
            selectedKeys={[filters.sortBy]}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="w-full"
            size="sm"
            classNames={{
              trigger: "h-10",
              value: "text-sm",
            }}
          >
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
