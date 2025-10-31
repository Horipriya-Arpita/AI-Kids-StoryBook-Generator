"use client";

import { Card, CardBody, CardFooter, Chip, Avatar, User, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart, FaEye, FaComment, FaStar, FaLock, FaEdit, FaTrash } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

export default function StoryCard({ story, onStoryDeleted }) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isLiked, setIsLiked] = useState(story.isLikedByUser);
  const [likeCount, setLikeCount] = useState(story.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleEdit = (e) => {
    e.stopPropagation();
    router.push(`/edit-story/${story.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onOpen();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/story/delete/${story.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Story deleted successfully!");
        onClose();
        if (onStoryDeleted) {
          onStoryDeleted(story.id);
        } else {
          router.refresh();
        }
      } else {
        toast.error(data.error || "Failed to delete story");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    } finally {
      setIsDeleting(false);
    }
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

          {/* Privacy Badge and Action Buttons */}
          <div className="absolute top-2 left-2 flex gap-2">
            {!story.isPublic && (
              <Chip
                startContent={<FaLock className="text-xs" />}
                size="sm"
                color="warning"
                variant="flat"
              >
                Private
              </Chip>
            )}

            {/* Edit and Delete Buttons (only for own stories) */}
            {story.isOwnStory && (
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="flat"
                  onClick={handleEdit}
                  aria-label="Edit story"
                >
                  <FaEdit />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  onClick={handleDeleteClick}
                  aria-label="Delete story"
                >
                  <FaTrash />
                </Button>
              </div>
            )}
          </div>

          {/* Age Group Badge */}
          <div className="absolute top-2 right-2">
            <Chip size="sm" color={getAgeGroupColor(story.ageGroup)} variant="flat">
              {story.ageGroup}
            </Chip>
          </div>

          {/* Like Button */}
          <div
            onClick={handleLike}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLike(e);
              }
            }}
            className={`absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-transform ${isLiking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={isLiked ? "Unlike story" : "Like story"}
          >
            {isLiked ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-xl" />
            )}
          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Story</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this story? This action cannot be undone.</p>
            <p className="text-sm text-gray-500 mt-2">
              This will permanently delete the story, all its images, likes, and comments.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
