"use client";

import { Card, CardBody, CardFooter, Chip, Avatar, User } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart, FaEye, FaComment, FaStar, FaLock } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";

export default function StoryCard({ story }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isLiked, setIsLiked] = useState(story.isLikedByUser);
  const [likeCount, setLikeCount] = useState(story.likeCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch("/api/story/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error("Error liking story:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/view-story/${story.id}`);
  };

  const getAgeGroupColor = (ageGroup) => {
    if (ageGroup.includes("0-2")) return "success";
    if (ageGroup.includes("3-5")) return "primary";
    if (ageGroup.includes("5-8")) return "secondary";
    return "default";
  };

  return (
    <Card
      isPressable
      onPress={handleCardClick}
      className="group hover:scale-105 transition-transform duration-300 cursor-pointer"
    >
      <CardBody className="p-0">
        {/* Cover Image */}
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Privacy Badge */}
          {!story.isPublic && (
            <div className="absolute top-2 left-2">
              <Chip
                startContent={<FaLock className="text-xs" />}
                size="sm"
                color="warning"
                variant="flat"
              >
                Private
              </Chip>
            </div>
          )}

          {/* Age Group Badge */}
          <div className="absolute top-2 right-2">
            <Chip size="sm" color={getAgeGroupColor(story.ageGroup)} variant="flat">
              {story.ageGroup}
            </Chip>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            aria-label={isLiked ? "Unlike story" : "Like story"}
          >
            {isLiked ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-xl" />
            )}
          </button>
        </div>

        {/* Story Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold line-clamp-2 mb-2">{story.title}</h3>

          {/* Author */}
          <div className="mb-3">
            <User
              name={story.author.username || `${story.author.firstName} ${story.author.lastName}`}
              description={story.storyType}
              avatarProps={{
                src: story.author.profileImage,
                size: "sm",
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FaHeart className="text-red-500" />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye />
              <span>{story.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaComment />
              <span>{story.commentCount}</span>
            </div>
            {story.rating > 0 && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                <span>{story.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
