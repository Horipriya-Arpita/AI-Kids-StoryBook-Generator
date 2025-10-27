"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Spinner } from "@heroui/react";
import Header from "../_components/Header";
import StoryCard from "../_components/StoryCard";
import FilterSidebar from "../_components/FilterSidebar";
import SearchBar from "../_components/SearchBar";
import TrendingCarousel from "../_components/TrendingCarousel";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function ExplorePage() {
  const [stories, setStories] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  });

  const [filters, setFilters] = useState({
    search: "",
    storyType: "",
    ageGroup: "",
    imageType: "",
    privacy: "all",
    sortBy: "recent",
  });

  // Fetch stories
  const fetchStories = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await fetch(`/api/story/explore?${params}`);
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
        setPagination({
          ...pagination,
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          hasMore: data.pagination.hasMore,
        });
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Fetch trending stories for carousel
  const fetchTrendingStories = async () => {
    try {
      const params = new URLSearchParams({
        sortBy: "trending",
        limit: "5",
        privacy: "public",
      });

      const response = await fetch(`/api/story/explore?${params}`);
      const data = await response.json();

      if (data.success) {
        setTrendingStories(data.stories);
      }
    } catch (error) {
      console.error("Error fetching trending stories:", error);
    }
  };

  useEffect(() => {
    fetchStories(1);
  }, [filters]);

  useEffect(() => {
    fetchTrendingStories();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchChange = useCallback((searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
    }));
  }, []);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      storyType: "",
      ageGroup: "",
      imageType: "",
      privacy: "all",
      sortBy: "recent",
    });
  };

  const handlePageChange = (newPage) => {
    fetchStories(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Explore Magical Stories
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Discover amazing stories created by our community
          </p>
        </div>

        {/* Trending Carousel */}
        {trendingStories.length > 0 && (
          <div className="mb-6">
            <TrendingCarousel stories={trendingStories} />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearchChange} initialValue={filters.search} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Mobile Filter Sidebar */}
          <div className="lg:hidden">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Stories Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">No stories found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Try adjusting your filters or search term
                </p>
                <Button color="primary" onPress={handleClearFilters} size="sm">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{stories.length}</span> stories found
                  {pagination.totalPages > 1 &&
                    ` • Page ${pagination.page} of ${pagination.totalPages}`}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8 pb-4">
                    <Button
                      isDisabled={pagination.page === 1}
                      onPress={() => handlePageChange(pagination.page - 1)}
                      startContent={<FaArrowLeft className="text-xs" />}
                      variant="flat"
                      size="sm"
                    >
                      Previous
                    </Button>

                    <span className="text-xs text-gray-600 dark:text-gray-400 px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <Button
                      isDisabled={!pagination.hasMore}
                      onPress={() => handlePageChange(pagination.page + 1)}
                      endContent={<FaArrowRight className="text-xs" />}
                      variant="flat"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
