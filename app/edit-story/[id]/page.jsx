"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Input,
  Textarea,
  Switch,
  Card,
  CardBody,
  Spinner,
} from "@heroui/react";
import { FaGlobe, FaLock, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

function EditStory({ params }) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [storyId, setStoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [storyTitle, setStoryTitle] = useState("");
  const [storySubject, setStorySubject] = useState("");
  const [storyType, setStoryType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [imageType, setImageType] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [chapters, setChapters] = useState([]);

  // Fetch story data when component mounts
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setStoryId(id);

        // Fetch story content
        const storyResponse = await fetch(`/api/story/get-story?id=${id}`);
        const storyResult = await storyResponse.json();

        if (!storyResult.success || !storyResult.story) {
          throw new Error("Story not found");
        }

        const story = storyResult.story;

        // Check if user owns the story
        if (!isSignedIn || !user || story.user?.clerk_id !== user.id) {
          toast.error("You don't have permission to edit this story");
          router.push(`/view-story/${id}`);
          return;
        }

        // Parse the story content
        let parsedContent;
        if (typeof story.content === "string") {
          let cleanContent = story.content.trim();
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent
              .replace(/^```json\s*/, "")
              .replace(/```\s*$/, "");
          } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent
              .replace(/^```\s*/, "")
              .replace(/```\s*$/, "");
          }
          parsedContent = JSON.parse(cleanContent);
        } else {
          parsedContent = story.content;
        }

        // Set form data
        setStoryTitle(parsedContent.storyTitle || story.storySubject || "");
        setStorySubject(story.storySubject || "");
        setStoryType(story.storyType || "");
        setAgeGroup(story.ageGroup || "");
        setImageType(story.imageType || "");
        setIsPublic(story.isPublic || false);
        setChapters(parsedContent.chapters || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching story:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchStoryData();
    }
  }, [params, isSignedIn, user, router]);

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = {
      ...updatedChapters[index],
      [field]: value,
    };
    setChapters(updatedChapters);
  };

  const handleSave = async () => {
    if (!storyTitle || !storySubject) {
      toast.error("Story title and subject are required");
      return;
    }

    setSaving(true);

    try {
      // Reconstruct the content object
      const updatedContent = {
        storyTitle,
        storyCover: {
          imagePrompt: `A book cover for a ${storyType} story about ${storySubject}`,
        },
        chapters: chapters.map((chapter, index) => ({
          chapterNumber: index + 1,
          chapterTitle: chapter.chapterTitle,
          textContent:
            chapter.textContent || chapter.description || chapter.content,
          imagePrompt: chapter.imagePrompt,
        })),
      };

      // Submit update
      const response = await fetch(`/api/story/update/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyTitle,
          storySubject,
          storyType,
          ageGroup,
          imageType,
          isPublic,
          content: updatedContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Story updated successfully!");
        router.push(`/view-story/${storyId}`);
      } else {
        toast.error(data.error || "Failed to update story");
      }
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("Failed to update story");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/view-story/${storyId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-10 md:px-20 lg:px-40 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Loading story...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 md:px-20 lg:px-40 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">
            Error Loading Story
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button
            color="primary"
            className="mt-6"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 md:px-20 lg:px-40 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-4xl text-primary">Edit Story</h2>
        <div className="flex gap-2">
          <Button
            color="default"
            variant="bordered"
            startContent={<FaTimes />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<FaSave />}
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Story Metadata */}
        <Card>
          <CardBody className="space-y-6">
            <h3 className="text-2xl font-bold">Story Details</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Story Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter story title"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Story Subject <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter story subject"
                value={storySubject}
                onChange={(e) => setStorySubject(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Story Type
                </label>
                <Input
                  placeholder="e.g., Educational"
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Age Group
                </label>
                <Input
                  placeholder="e.g., 0-2 Years"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image Style
                </label>
                <Input
                  placeholder="e.g., 3D Cartoon"
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mt-4">
              <Switch
                isSelected={isPublic}
                onValueChange={setIsPublic}
                color="success"
                size="lg"
                thumbIcon={({ isSelected, className }) =>
                  isSelected ? (
                    <FaGlobe className={className} />
                  ) : (
                    <FaLock className={className} />
                  )
                }
              >
                <div className="flex flex-col">
                  <p className="font-semibold">
                    {isPublic ? "Public Story" : "Private Story"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isPublic
                      ? "Everyone can view this story"
                      : "Only you can view this story"}
                  </p>
                </div>
              </Switch>
            </div>
          </CardBody>
        </Card>

        {/* Chapters */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Chapters</h3>
          {chapters.map((chapter, index) => (
            <Card key={index}>
              <CardBody className="space-y-6">
                <h4 className="text-xl font-semibold">
                  Chapter {chapter.chapterNumber}
                </h4>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chapter Title
                  </label>
                  <Input
                    placeholder="Enter chapter title"
                    value={chapter.chapterTitle}
                    onChange={(e) =>
                      handleChapterChange(index, "chapterTitle", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chapter Content
                  </label>
                  <Textarea
                    placeholder="Enter chapter content"
                    value={
                      chapter.textContent ||
                      chapter.description ||
                      chapter.content ||
                      ""
                    }
                    onChange={(e) =>
                      handleChapterChange(index, "textContent", e.target.value)
                    }
                    minRows={5}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Save/Cancel Buttons at bottom */}
        <div className="flex justify-end gap-2 mt-8">
          <Button
            color="default"
            variant="bordered"
            startContent={<FaTimes />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<FaSave />}
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditStory;
