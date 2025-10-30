"use client";

import {
  Card,
  CardBody,
  Textarea,
  Button,
  User,
  Select,
  SelectItem,
  Divider,
  Spinner,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { FaStar, FaRegStar, FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CommentSection({ storyId }) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchComments();
  }, [storyId, sortBy]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/story/comments/${storyId}?sortBy=${sortBy}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/story/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId,
          content: newComment.trim(),
          rating: rating ? parseInt(rating) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment("");
        setRating(null);
        fetchComments(); // Refresh to get updated stats
      } else {
        alert(data.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <FaStar className="text-yellow-500" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Card>
        <CardBody className="p-6">
          {/* Header with Stats */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Comments ({stats?.totalComments || 0})
            </h2>
            {stats && stats.averageRating > 0 && (
              <div className="flex items-center gap-2">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-lg font-semibold">
                  {stats.averageRating.toFixed(1)} / 5
                </span>
              </div>
            )}
          </div>

          {/* Comment Form */}
          <div className="mb-6">
            <Textarea
              placeholder={
                isSignedIn
                  ? "Share your thoughts about this story..."
                  : "Sign in to leave a comment"
              }
              value={newComment}
              onValueChange={setNewComment}
              disabled={!isSignedIn}
              minRows={3}
              className="mb-3"
            />

            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Rate this story:
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      disabled={!isSignedIn}
                      className="hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      {star <= (rating || 0) ? (
                        <FaStar className="text-yellow-500 text-xl" />
                      ) : (
                        <FaRegStar className="text-gray-300 text-xl" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                color="primary"
                endContent={<FaPaperPlane />}
                onPress={handleSubmitComment}
                disabled={!isSignedIn || !newComment.trim() || submitting}
                isLoading={submitting}
              >
                Post Comment
              </Button>
            </div>
          </div>

          <Divider className="my-6" />

          {/* Sort Options */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2 ml-1">Sort by:</div>
            <Select
              selectedKeys={[sortBy]}
              onChange={(e) => setSortBy(e.target.value)}
              className="max-w-xs"
              size="sm"
            >
              <SelectItem key="recent" value="recent">
                Most Recent
              </SelectItem>
              <SelectItem key="oldest" value="oldest">
                Oldest First
              </SelectItem>
              <SelectItem key="topRated" value="topRated">
                Top Rated
              </SelectItem>
            </Select>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm py-8 text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} shadow="sm">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <User
                            name={
                              comment.author.username ||
                              `${comment.author.firstName} ${comment.author.lastName}`
                            }
                            description={formatDate(comment.createdAt)}
                            avatarProps={{
                              src: comment.author.profileImage,
                              size: "sm",
                            }}
                          />
                          {comment.rating && renderStars(comment.rating)}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
