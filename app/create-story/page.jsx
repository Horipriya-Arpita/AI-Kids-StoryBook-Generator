"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs";
import StorySubjectInput from '../_components/StorySubjectInput'
import StoryType from '../_components/StoryType'
import AgeGroup from '../_components/AgeGroup'
import ImageStyle from '../_components/ImageStyle'
import { Button, Switch } from '@heroui/react';
import { FaGlobe, FaLock } from 'react-icons/fa';
import { AI_Prompt } from '../constants/prompt';
import { chatSession } from '@/service/AIModel';
import { content } from '@/tailwind.config';
import CustomLoader from '../_components/CustomLoader';
import { useRouter } from 'next/navigation';


function CreateStory() {

  const { userId } = useAuth(); // Get userId from Clerk
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); // Track loading state
  const [isPublic, setIsPublic] = useState(false); // Privacy setting
  // Update formData with userId when it loads
  useEffect(() => {
    if (userId) {
      saveUser(userId);
      setFormData((prev) => ({ ...prev, userId }));
    }
  }, [userId]); // Runs when userId changes

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
      alert("All fields are required");
      return;
    }

    setLoading(true);

    const FINAL_PROMPT = AI_Prompt.replace("{storySubject}", formData?.storySubject)
      .replace("{storyType}", formData?.storyType)
      .replace("{ageGroup}", formData?.ageGroup)
      .replace("{imageType}", formData?.imageType);

    if (!FINAL_PROMPT || FINAL_PROMPT.trim() === "") {
      console.error("FINAL_PROMPT is empty. Please check the input.");
      return;
    }
    console.log(FINAL_PROMPT); 

    //AI response 
    try {
      // const result = await chatSession.sendMessage(FINAL_PROMPT);
      // const content = result?.response?.text();
      // // Access the AI response text
      // console.log("AI Response:", content);

      // if (!content) {
      //   alert("AI failed to generate content. Please try again.");
      //   return;
      // }


    //const res = await fetch(`/api/story/get?id=${formData.storyId}`);
    const storyId = "279e11fe-b7c7-4026-932d-aeed9da89cba";
    const res = await fetch(`/api/story/get-story?id=${storyId}`);
    const response = await res.json();

    if (!response.success || !response.story) {
      alert("Failed to fetch story. Please try again.");
      return;
    }

    const { storySubject, storyType, ageGroup, imageType, content } = response.story;

    // Update formData with fetched story details
    const updatedFormData = {
      userId: formData.userId,
      storySubject,
      storyType,
      ageGroup,
      imageType,
      content,
      isPublic, // Include privacy setting
    };

      // Update formData state with AI-generated content
      //const updatedFormData = { ...formData, content };

      // const res = await fetch("/api/story/create", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(updatedFormData),
      // });
      // const response = await res.json();
      // console.log("Story Created:", response);

      // if (response.success) {
      //   alert("Story saved successfully!");
      //   // Proceed to next step (e.g., generating images)
      // } else {
      //   alert("Failed to save story.");
      // }

      const saveRes = await fetch("/api/story/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });
  
      const saveResponse = await saveRes.json();
      console.log("Story Saved:.........................", saveResponse);
  
      if (saveResponse.success) {
        //alert("Story saved successfully!");
        router?.replace('/view-story/'+saveResponse.story.id);

      } else {
        alert("Failed to save story.");
      }

    } catch (error) {
      console.error("Error submitting story:", error);
      alert("Error submitting story. Please try again.");
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
        <Button color='primary' className='p-10 text-2xl' onClick={handleSubmit} > {loading ? "Generating..." : "Generate Story"}  </Button>
      </div>
      <CustomLoader isLoading={loading}/>
    </div>
  )
}

export default CreateStory
