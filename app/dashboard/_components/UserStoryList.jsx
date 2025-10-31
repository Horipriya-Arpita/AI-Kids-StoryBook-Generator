"use client";

import React, { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import StoryCard from "@/app/_components/StoryCard";

function UserStoryList() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserStories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/story/explore?privacy=myStories&sortBy=recent");
      const data = await response.json();

      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserStories();
  }, []);

  const handleStoryDeleted = (deletedStoryId) => {
    setStories((prevStories) =>
      prevStories.filter((story) => story.id !== deletedStoryId)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-xl font-bold mb-2">No stories yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create your first story to see it here!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onStoryDeleted={handleStoryDeleted}
          />
        ))}
      </div>
    </div>
  );
}

export default UserStoryList;
