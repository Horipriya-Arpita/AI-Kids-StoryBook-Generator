import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Now it will work!
import { content } from "@/tailwind.config";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { storage } from "@/config/firebaseConfig";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/config/firebaseConfig"; 
import { collection, addDoc, Timestamp } from "firebase/firestore"; 
import cloudinary from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    console.log(body, "boooooooodyyyyyyy");
    const { userId: clerkId, storySubject, storyType, ageGroup, imageType, content } = body;

    if (!clerkId || !storySubject || !storyType || !ageGroup || !imageType || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 🔹 Find internal user ID based on Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
      select: { id: true }, // Only fetch the internal ID
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const parsedContent = JSON.parse(content);
    const coverImagePrompt = 'Add text with title: -'+parsedContent.storyTitle + '- in bold text for book cover,' + parsedContent.storyCover.imagePrompt;
    const chapterImagePrompts = parsedContent.chapters.map(chapter => chapter.imagePrompt);

    console.log(coverImagePrompt,">>>>>>>>");
    console.log(chapterImagePrompts,">>>>>>>>>>>>>>>>>>>");
    // 🔹 Store the story using the internal user ID
    // const newStory = await prisma.story.create({
    //   data: {
    //     userId: user.id, // Use the internal ID instead of clerk_id
    //     storySubject,
    //     storyType,
    //     ageGroup,
    //     imageType,
    //     content, // JSON format of generated story
    //   },
    // });

    const newStory = {
      id: '279e11fe-b7c7-4026-932d-aeed9da89cba',
    }

    //🔹 Generate and store the cover image
    const coverImageUrl = "https://res.cloudinary.com/delen7nxs/image/upload/v1745092473/generated_images/ai-97f4cb27-de2d-4ecf-831f-e301e0418040.png.jpg";//await generateImageFromPrompt(coverImagePrompt);
    console.log("--------->",coverImageUrl);

    if (!coverImageUrl) {
      return NextResponse.json({ error: "Failed to generate cover image" }, { status: 500 });
    }

    // Store cover image in the database (or as per your storage method)
    await prisma.image.create({
      data: {
        storyId: newStory.id,
        prompt: coverImagePrompt,
        imageUrl: coverImageUrl,
        isCover: true,
      },
    });


    // 🔹 Generate and store chapter images
    for (let i = 0; i < chapterImagePrompts.length; i++) {
      const chapterPrompt = chapterImagePrompts[i];
      // const imageUrl = await generateImageFromPrompt(chapterPrompt);

      const imageUrl = coverImageUrl;

      if (!imageUrl) {
        return NextResponse.json({ error: `Failed to generate image for chapter ${i + 1}` }, { status: 500 });
      }

      // Store chapter image in the database (or as per your storage method)
      await prisma.image.create({
        data: {
          storyId: newStory.id,
          prompt: chapterPrompt,
          imageUrl: imageUrl,
          isCover: false,
        },
      });
    }

    //return NextResponse.json({ success: true, story: "wowwww" }, { status: 201 });

    return NextResponse.json({ success: true, story: newStory }, { status: 201 });
    //return NextResponse.json({ success: true, userId, storySubject, storyType, ageGroup, imageType, content }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateImageFromPrompt(prompt) {
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  const model = "stabilityai/stable-diffusion-3.5-large";//"stabilityai/stable-diffusion-2-1"; // Verified model

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate image: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
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
    console.log("Cloudinary URL:", downloadUrl);

    
    return downloadUrl;
  } catch (error) {
    console.error("Error generating image:", error);
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


//279e11fe-b7c7-4026-932d-aeed9da89cba