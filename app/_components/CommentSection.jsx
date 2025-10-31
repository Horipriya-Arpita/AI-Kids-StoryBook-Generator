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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { FaStar, FaRegStar, FaPaperPlane, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        toast.success("Comment posted successfully!");
      } else {
        toast.error(data.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditRating(null);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;

    setUpdating(true);

    try {
      const response = await fetch(`/api/story/comment/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          rating: editRating ? parseInt(editRating) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, ...data.comment } : c
          )
        );
        handleCancelEdit();
        fetchComments(); // Refresh to get updated stats
        toast.success("Comment updated successfully!");
      } else {
        toast.error(data.error || "Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    setDeleting(commentToDelete);

    try {
      const response = await fetch(`/api/story/comment/${commentToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setComments(comments.filter((c) => c.id !== commentToDelete));
        fetchComments(); // Refresh to get updated stats
        toast.success("Comment deleted successfully!");
        onClose();
      } else {
        toast.error(data.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeleting(null);
      setCommentToDelete(null);
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
                    {editingId === comment.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onValueChange={setEditContent}
                          minRows={3}
                          placeholder="Edit your comment..."
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Rating:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setEditRating(star)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  {star <= (editRating || 0) ? (
                                    <FaStar className="text-yellow-500 text-xl" />
                                  ) : (
                                    <FaRegStar className="text-gray-300 text-xl" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              startContent={<FaSave />}
                              onPress={() => handleUpdateComment(comment.id)}
                              isLoading={updating}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<FaTimes />}
                              onPress={handleCancelEdit}
                              disabled={updating}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
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
                            <div className="flex items-center gap-2">
                              {comment.rating && renderStars(comment.rating)}
                              {/* Edit/Delete buttons - only show for comment owner */}
                              {isSignedIn && user?.id === comment.author.clerkId && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    onPress={() => handleEditComment(comment)}
                                    className="min-w-unit-8 h-8"
                                  >
                                    <FaEdit className="text-gray-600 dark:text-gray-400" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    onPress={() => handleDeleteComment(comment.id)}
                                    isLoading={deleting === comment.id}
                                    className="min-w-unit-8 h-8"
                                  >
                                    <FaTrash className="text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              (edited)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Comment
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDelete}
                  isLoading={deleting}
                  disabled={deleting}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
