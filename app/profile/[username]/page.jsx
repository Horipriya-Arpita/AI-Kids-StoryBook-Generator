"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, Button, Spinner, Chip } from "@heroui/react";
import Header from "../../_components/Header";
import StoryCard from "../../_components/StoryCard";
import { FaArrowLeft, FaArrowRight, FaCalendar, FaHeart, FaEye, FaBook } from "react-icons/fa";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  });

  const fetchProfile = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/user/profile/${username}?${params}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setStories(data.stories);
        setPagination({
          ...pagination,
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          hasMore: data.pagination.hasMore,
        });
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile(1);
    }
  }, [username]);

  const handlePageChange = (newPage) => {
    fetchProfile(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStoryDeleted = (deletedStoryId) => {
    setStories((prevStories) => prevStories.filter((story) => story.id !== deletedStoryId));
    fetchProfile(pagination.page);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-2">{error}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist or their profile is unavailable.
          </p>
          <Button color="primary" href="/explore" as="a">
            Explore Stories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <Avatar
              src={profile.profileImage}
              alt={profile.username || `${profile.firstName} ${profile.lastName}`}
              className="w-32 h-32"
              isBordered
              color="primary"
            />

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profile.username || `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <FaCalendar className="text-sm" />
                <span className="text-sm">Member since {formatDate(profile.memberSince)}</span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Chip
                  startContent={<FaBook className="text-sm" />}
                  variant="flat"
                  color="primary"
                  size="lg"
                >
                  {profile.stats.totalStories} {profile.stats.totalStories === 1 ? "Story" : "Stories"}
                </Chip>
                <Chip
                  startContent={<FaHeart className="text-sm" />}
                  variant="flat"
                  color="danger"
                  size="lg"
                >
                  {profile.stats.totalLikes} {profile.stats.totalLikes === 1 ? "Like" : "Likes"}
                </Chip>
                <Chip
                  startContent={<FaEye className="text-sm" />}
                  variant="flat"
                  color="secondary"
                  size="lg"
                >
                  {profile.stats.totalViews} {profile.stats.totalViews === 1 ? "View" : "Views"}
                </Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Public Stories {stories.length > 0 && `(${pagination.totalPages > 1 ? 'Page ' + pagination.page + ' of ' + pagination.totalPages : stories.length})`}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">No public stories yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This user hasn't shared any public stories yet.
              </p>
            </div>
          ) : (
            <>
              {/* Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} onStoryDeleted={handleStoryDeleted} />
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
        </div>
      </div>
    </div>
  );
}
