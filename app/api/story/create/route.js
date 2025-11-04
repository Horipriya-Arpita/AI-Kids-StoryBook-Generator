import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Now it will work!
import { content } from "@/tailwind.config";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import cloudinary from "cloudinary";
import { decrypt } from "@/lib/encryption";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body, "boooooooodyyyyyyy");
    const { userId: clerkId, storySubject, storyType, ageGroup, imageType, content, isPublic = false } = body;

    if (!clerkId || !storySubject || !storyType || !ageGroup || !imageType || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 🔹 Find internal user ID and check quota
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
      include: {
        apiKeys: true, // Include API keys to check if user has custom keys
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔹 Check if user has custom API keys
    const hasCustomKeys = !!(
      user.apiKeys?.huggingFaceApiKey &&
      user.apiKeys?.isActive
    );

    // 🔹 Check quota - only enforce if user doesn't have custom keys
    if (!hasCustomKeys) {
      if (user.freeStoriesUsed >= user.freeStoryLimit) {
        return NextResponse.json(
          {
            error: "Free story limit reached",
            message: `You've used all ${user.freeStoryLimit} free stories. Add your own API keys in Settings to create unlimited stories.`,
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    // 🔹 Get the HuggingFace API key (user's or system)
    let huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    if (hasCustomKeys && user.apiKeys.huggingFaceApiKey) {
      try {
        huggingFaceApiKey = decrypt(user.apiKeys.huggingFaceApiKey);
        console.log("✅ Using user's HuggingFace API key");
      } catch (error) {
        console.error("Failed to decrypt user's HuggingFace API key:", error);
        // Fall back to system key
        console.log("⚠️ Falling back to system HuggingFace API key");
      }
    } else {
      console.log("Using system HuggingFace API key");
    }

    // Clean up the content string (remove markdown code blocks if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsedContent = JSON.parse(cleanContent);
    const coverImagePrompt = 'Add text with title: -'+parsedContent.storyTitle + '- in bold text for book cover,' + parsedContent.storyCover.imagePrompt;
    const chapterImagePrompts = parsedContent.chapters.map(chapter => chapter.imagePrompt);

    console.log(coverImagePrompt,">>>>>>>>");
    console.log(chapterImagePrompts,">>>>>>>>>>>>>>>>>>>");
    // 🔹 Store the story using the internal user ID
    const newStory = await prisma.story.create({
      data: {
        userId: user.id, // Use the internal ID instead of clerk_id
        storySubject,
        storyType,
        ageGroup,
        imageType,
        storyTitle: parsedContent.storyTitle, // Extract title for searchability
        content, // JSON format of generated story
        isPublic, // Privacy setting
      },
    });

    //🔹 Generate and store the cover image
    const placeholderCoverImage = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=600&fit=crop";
    let coverImageUrl = await generateImageFromPrompt(coverImagePrompt, 0, huggingFaceApiKey);

    // Use placeholder if generation fails
    if (!coverImageUrl) {
      console.warn("⚠️ Cover image generation failed, using placeholder");
      coverImageUrl = placeholderCoverImage;
    }

    console.log("Cover Image URL:", coverImageUrl);

    // Store cover image in the database
    await prisma.image.create({
      data: {
        storyId: newStory.id,
        prompt: coverImagePrompt,
        imageUrl: coverImageUrl,
        isCover: true,
      },
    });


    // 🔹 Generate and store chapter images
    const placeholderChapterImages = [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503751071777-d2918b21bbd9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    ];

    for (let i = 0; i < chapterImagePrompts.length; i++) {
      const chapterPrompt = chapterImagePrompts[i];
      let imageUrl = await generateImageFromPrompt(chapterPrompt, 0, huggingFaceApiKey);

      // Use placeholder if generation fails
      if (!imageUrl) {
        console.warn(`⚠️ Chapter ${i + 1} image generation failed, using placeholder`);
        imageUrl = placeholderChapterImages[i % placeholderChapterImages.length];
      }

      // Store chapter image in the database
      await prisma.image.create({
        data: {
          storyId: newStory.id,
          prompt: chapterPrompt,
          imageUrl: imageUrl,
          isCover: false,
        },
      });
    }

    // 🔹 Increment usage counter if using system keys
    if (!hasCustomKeys) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          freeStoriesUsed: {
            increment: 1,
          },
        },
      });
      console.log(`✅ User ${user.id} has now used ${user.freeStoriesUsed + 1}/${user.freeStoryLimit} free stories`);
    }

    return NextResponse.json({ success: true, story: newStory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateImageFromPrompt(prompt, retryCount = 0, apiKey = null) {
  // Use provided API key or fall back to system key
  const huggingFaceApiKey = apiKey || process.env.HUGGING_FACE_API_KEY;

  // List of models to try (in order of preference)
  const models = [
    "black-forest-labs/FLUX.1-schnell", // Latest high-quality fast model
    "stabilityai/sd-turbo",             // Very fast turbo model
    "stabilityai/stable-diffusion-2-1", // Reliable fallback
    "runwayml/stable-diffusion-v1-5",   // Additional fallback
    "stable-diffusion-v1-5/stable-diffusion-v1-5" // Final fallback
  ];

  const model = models[Math.min(retryCount, models.length - 1)];
  const maxRetries = 5; // Increased to match number of models
  const waitTime = 25000; // 25 seconds for model to load (some models need more time)

  try {
    console.log(`Attempting to generate image with model: ${model} (Attempt ${retryCount + 1})`);

    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${huggingFaceApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true } // Wait for model to load
      }),
    });

    // If model is loading, wait and retry
    if (response.status === 503) {
      const errorData = await response.json();
      if (errorData.error && errorData.error.includes("loading") && retryCount < maxRetries) {
        console.log(`Model loading, waiting ${waitTime/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateImageFromPrompt(prompt, retryCount + 1, apiKey);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Model ${model} failed:`, errorText);

      // Try next model if available
      if (retryCount < models.length - 1) {
        console.log("Trying alternative model...");
        return generateImageFromPrompt(prompt, retryCount + 1, apiKey);
      }

      throw new Error(`Failed to generate image: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();

    // Check if blob is valid
    if (blob.size === 0) {
      throw new Error("Received empty image blob");
    }

    const base64Image = await convertImage(blob);

    if (!base64Image) {
      throw new Error("Failed to convert image to base64");
    }

    // Upload to Cloudinary
    const fileName = `ai-${uuidv4()}.png`;
    const uploadResponse = await cloudinary.v2.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      {
        public_id: fileName,
        folder: "generated_images",
      }
    );

    const downloadUrl = uploadResponse.secure_url;
    console.log("✅ Image generated successfully:", downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error("Error generating image:", error);

    // Retry with different model if we haven't exhausted all options
    if (retryCount < models.length - 1) {
      console.log("Retrying with alternative model...");
      return generateImageFromPrompt(prompt, retryCount + 1, apiKey);
    }

    // Return null after all retries exhausted
    return null;
  }
}

async function convertImage(blob) {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    return base64Image;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
}