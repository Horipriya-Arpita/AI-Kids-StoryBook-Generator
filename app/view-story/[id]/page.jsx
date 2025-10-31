"use client";
import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import ImagePage from "../_components/ImagePage";
import TextPage from "../_components/TextPage";
import CommentSection from "@/app/_components/CommentSection";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, User } from "@heroui/react";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft, FaEdit, FaTrash } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

function ViewStory({ params }) {
  const bookRef = useRef();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [count, setCount] = useState(0);
  const [storyId, setStoryId] = useState(null);
  const [storyData, setStoryData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnStory, setIsOwnStory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch story data when component mounts
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setStoryId(id);

        // Track view for this story
        if (id) {
          fetch(`/api/story/view/${id}`, {
            method: "POST",
          }).catch((error) => console.error("Error tracking view:", error));
        }

        // Fetch story content with images
        const storyResponse = await fetch(`/api/story/get-story?id=${id}`);
        const storyResult = await storyResponse.json();

        if (!storyResult.success || !storyResult.story) {
          throw new Error("Story not found");
        }

        const story = storyResult.story;

        // Save author data
        if (story.user) {
          setAuthorData({
            username: story.user.username,
            firstName: story.user.first_name,
            lastName: story.user.last_name,
            profileImage: story.user.profile_image,
          });
        }

        // Check if this is the user's own story
        if (isSignedIn && user && story.user?.clerk_id === user.id) {
          setIsOwnStory(true);
        }

        // Parse the story content (it's stored as JSON string or object)
        let parsedContent;
        if (typeof story.content === 'string') {
          // Clean up the content string (remove markdown code blocks if present)
          let cleanContent = story.content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }
          parsedContent = JSON.parse(cleanContent);
        } else {
          parsedContent = story.content;
        }

        // Get images from the story (now included in the response)
        const images = story.images || [];

        // Get cover image
        const coverImage = images.find(img => img.isCover)?.imageUrl ||
                          "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop";

        // Map chapters with their images
        const chapterImages = images.filter(img => !img.isCover);
        const chapters = parsedContent.chapters?.map((chapter, index) => {
          // Handle different possible field names for chapter content
          const chapterContent = chapter.textContent || chapter.description || chapter.text || chapter.content || chapter.chapterText || "";

          console.log(`Chapter ${index + 1} data:`, chapter);
          console.log(`Chapter ${index + 1} content:`, chapterContent);

          return {
            title: `Chapter ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
            content: chapterContent,
            image: chapterImages[index]?.imageUrl || "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=500&fit=crop"
          };
        }) || [];

        setStoryData({
          title: parsedContent.storyTitle || story.storySubject || "Untitled Story",
          coverImage: coverImage,
          chapters: chapters
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching story:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [params, isSignedIn, user]);

  const handleAuthorClick = () => {
    if (authorData?.username) {
      router.push(`/profile/${authorData.username}`);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-story/${storyId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/story/delete/${storyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Story deleted successfully!");
        onClose();
        router.push("/dashboard");
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

  // Loading state
  if (loading) {
    return (
      <div className="p-10 md:px-20 lg:px-40 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Loading your story...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !storyData) {
    return (
      <div className="p-10 md:px-20 lg:px-40 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Story Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || "This story doesn't exist."}</p>
          <Button
            color="primary"
            className="mt-6"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 md:px-20 lg:px-40 flex-col min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-4xl text-center p-10 bg-primary text-white rounded-xl shadow-lg flex-1">
          {storyData.title}
        </h2>
        {isOwnStory && (
          <div className="flex gap-2 ml-4">
            <Button
              color="primary"
              startContent={<FaEdit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              color="danger"
              startContent={<FaTrash />}
              onClick={onOpen}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Author Info */}
      {authorData && (
        <div className="mb-6 flex justify-center">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md ${authorData.username ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
            onClick={authorData.username ? handleAuthorClick : undefined}
            role={authorData.username ? "button" : undefined}
            tabIndex={authorData.username ? 0 : undefined}
            onKeyDown={authorData.username ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAuthorClick();
              }
            } : undefined}
          >
            <User
              name={authorData.username || `${authorData.firstName || ''} ${authorData.lastName || ''}`.trim() || 'Anonymous'}
              description="Story Author"
              avatarProps={{
                src: authorData.profileImage,
                size: "md",
              }}
            />
          </div>
        </div>
      )}

      <div className="relative w-full flex justify-center">
        <HTMLFlipBook
          width={500}
          height={500}
          showCover={true}
          className="mt-10 shadow-2xl"
          useMouseEvents={false}
          ref={bookRef}
        >
          {/* Page 0: Cover Page */}
          <div>
            <BookCoverPage imageUrl={storyData.coverImage} title={storyData.title} pageNumber={0} />
          </div>

          {/* Alternate between Image Page and Text Page for each chapter */}
          {storyData.chapters.flatMap((chapter, index) => [
            // Image page for this chapter
            <div key={`image-${index}`}>
              <ImagePage
                imageUrl={chapter.image}
                chapterTitle={chapter.title}
                pageNumber={index * 2 + 1}
              />
            </div>,
            // Text page for this chapter
            <div key={`text-${index}`}>
              <TextPage
                chapterTitle={chapter.title}
                chapterContent={chapter.content}
                pageNumber={index * 2 + 2}
              />
            </div>
          ])}
        </HTMLFlipBook>

        {count != 0 && (
          <div
            className="absolute -left-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipPrev();
              setCount(count - 1);
            }}
          >
            <FaArrowAltCircleLeft className="text-[50px] text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
        )}

        {count != storyData.chapters.length * 2 && (
          <div
            className="absolute -right-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipNext();
              setCount(count + 1);
            }}
          >

            <FaArrowAltCircleRight className="text-[50px] text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
        )}
      </div>

      
      {/* Comments Section */}
      {storyId && (
        <div className="mt-16">
          <CommentSection storyId={storyId} />
        </div>
      )}

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
    </div>
  );
}

export default ViewStory;
