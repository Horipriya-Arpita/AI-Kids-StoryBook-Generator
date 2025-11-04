"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs";
import StorySubjectInput from '../_components/StorySubjectInput'
import StoryType from '../_components/StoryType'
import AgeGroup from '../_components/AgeGroup'
import ImageStyle from '../_components/ImageStyle'
import { Button, Switch, Card, Chip } from '@heroui/react';
import { FaGlobe, FaLock } from 'react-icons/fa';
import { FiAlertCircle, FiSettings } from 'react-icons/fi';
import { AI_Prompt } from '../constants/prompt';
import CustomLoader from '../_components/CustomLoader';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';


function CreateStory() {

  const { userId } = useAuth(); // Get userId from Clerk
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); // Track loading state
  const [isPublic, setIsPublic] = useState(false); // Privacy setting
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Update formData with userId when it loads
  useEffect(() => {
    if (userId) {
      saveUser(userId);
      setFormData((prev) => ({ ...prev, userId }));
      fetchUsageData();
    }
  }, [userId]); // Runs when userId changes

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/user/usage");
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const onHandleUserSelection = (data) => {
    setFormData((prev) => ({
      ...prev,
      [data.fieldName]: data.fieldValue,
    }));
  };

  const saveUser = async (userId) => {
    console.log(userId, "Saving user...");
    try {
      const res = await fetch("/api/auth/store-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ✅ Send as an object
      });
      const response = await res.json();
      console.log("User Created:", response);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  
 

  const handleSubmit = async () => {
    if (!formData?.storySubject || !formData?.storyType || !formData?.ageGroup || !formData?.imageType) {
      toast.error("All fields are required");
      return;
    }

    // Check quota before allowing story creation
    if (usageData && !usageData.canCreateStory) {
      toast.error("You've reached your free story limit!");
      router.push('/settings');
      return;
    }

    setLoading(true);

    const FINAL_PROMPT = AI_Prompt.replace("{storySubject}", formData?.storySubject)
      .replace("{storyType}", formData?.storyType)
      .replace("{ageGroup}", formData?.ageGroup)
      .replace("{imageType}", formData?.imageType);

    if (!FINAL_PROMPT || FINAL_PROMPT.trim() === "") {
      console.error("FINAL_PROMPT is empty. Please check the input.");
      setLoading(false);
      return;
    }
    console.log(FINAL_PROMPT);

    //AI response - now using server-side generation
    try {
      // Call server-side Gemini generation
      const generateRes = await fetch("/api/story/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          prompt: FINAL_PROMPT,
        }),
      });

      const generateResponse = await generateRes.json();

      if (!generateRes.ok) {
        if (generateResponse.limitReached) {
          toast.error(generateResponse.message);
          router.push('/settings');
          return;
        }
        throw new Error(generateResponse.error || "Failed to generate story content");
      }

      const content = generateResponse?.content;

      if (!content) {
        toast.error("AI failed to generate content. Please try again.");
        setLoading(false);
        return;
      }

      console.log("AI Response:", content);

      // Update formData state with AI-generated content
      const updatedFormData = {
        ...formData,
        content,
        isPublic // Include privacy setting
      };

      const saveRes = await fetch("/api/story/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      const saveResponse = await saveRes.json();
      console.log("Story Saved:", saveResponse);

      if (saveResponse.success) {
        toast.success("Story created successfully!");
        router?.replace('/view-story/'+saveResponse.story.id);
      } else {
        if (saveResponse.limitReached) {
          toast.error(saveResponse.message);
          router.push('/settings');
        } else {
          toast.error(saveResponse.error || "Failed to save story.");
        }
      }

    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error(error.message || "Error submitting story. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }

  };

  return (
    <div className='p-10 md:px-20 lg:px-40'>
      <h2 className='font-extrabold text-[70px] text-primary text-center'>CREATE  YOUR STORY</h2>
      <div className='text-2xl text-primary text-center'>
        Unlock your creativity with AI: Craft stories like never before! Let our AI bring your imagination to life, one story at a time.
      </div>

      {/* Usage Stats Banner */}
      {!loadingUsage && usageData && (
        <Card className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {usageData.hasCustomKeys ? (
                <>
                  <Chip color="success" variant="flat" size="lg">
                    Unlimited Stories
                  </Chip>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Using your custom API keys
                  </span>
                </>
              ) : (
                <>
                  <Chip
                    color={usageData.reachedLimit ? "danger" : usageData.remainingFreeStories <= 2 ? "warning" : "success"}
                    variant="flat"
                    size="lg"
                  >
                    {usageData.freeStoriesUsed}/{usageData.freeStoryLimit} Free Stories Used
                  </Chip>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usageData.remainingFreeStories > 0 ? (
                      `${usageData.remainingFreeStories} ${usageData.remainingFreeStories === 1 ? 'story' : 'stories'} remaining`
                    ) : (
                      "Limit reached"
                    )}
                  </span>
                </>
              )}
            </div>
            {!usageData.hasCustomKeys && (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<FiSettings />}
                onPress={() => router.push('/settings')}
              >
                Get Unlimited
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Limit Reached Alert */}
      {!loadingUsage && usageData && usageData.reachedLimit && !usageData.hasCustomKeys && (
        <Card className="mt-4 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-red-700 dark:text-red-300 text-lg mb-2">
                Free Story Limit Reached
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                You've used all {usageData.freeStoryLimit} free stories. Add your own API keys to continue creating unlimited stories at no cost to you.
              </p>
              <Button
                color="danger"
                startContent={<FiSettings />}
                onPress={() => router.push('/settings')}
              >
                Add API Keys in Settings
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-14'>
        {/* Story Subject */}
        <StorySubjectInput userSelection={onHandleUserSelection}/>
        {/* Story Subject */}
        <StoryType userSelection={onHandleUserSelection}/>
        {/* Story Subject */}
        <AgeGroup userSelection={onHandleUserSelection}/>
        {/* Story Subject */}
        <ImageStyle userSelection={onHandleUserSelection}/>
      </div>

      {/* Privacy Settings */}
      <div className='mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md'>
        <h3 className='text-xl font-bold mb-4'>Privacy Settings</h3>
        <Switch
          isSelected={isPublic}
          onValueChange={setIsPublic}
          color='success'
          size='lg'
          thumbIcon={({ isSelected, className }) =>
            isSelected ? (
              <FaGlobe className={className} />
            ) : (
              <FaLock className={className} />
            )
          }
        >
          <div className='flex flex-col gap-1'>
            <p className='text-base font-medium'>
              {isPublic ? 'Make this story public' : 'Keep this story private'}
            </p>
            <p className='text-sm text-gray-500'>
              {isPublic
                ? 'Your story will be visible to everyone on the explore page'
                : 'Only you will be able to see this story'}
            </p>
          </div>
        </Switch>
      </div>

      <div className='flex justify-end my-10'>
        <Button
          color='primary'
          className='p-10 text-2xl'
          onClick={handleSubmit}
          isDisabled={loading || (usageData && usageData.reachedLimit && !usageData.hasCustomKeys)}
          isLoading={loading}
        >
          {loading ? "Generating..." : usageData && usageData.reachedLimit && !usageData.hasCustomKeys ? "Limit Reached" : "Generate Story"}
        </Button>
      </div>
      <CustomLoader isLoading={loading}/>
    </div>
  )
}

export default CreateStory
