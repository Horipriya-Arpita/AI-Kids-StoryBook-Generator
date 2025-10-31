import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: storyId } = await params;
    const body = await request.json();

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerk_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if story exists and belongs to the user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    if (story.userId !== dbUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this story",
        },
        { status: 403 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};

    // Allow updating these fields
    if (body.storyTitle !== undefined) updateData.storyTitle = body.storyTitle;
    if (body.storySubject !== undefined) updateData.storySubject = body.storySubject;
    if (body.storyType !== undefined) updateData.storyType = body.storyType;
    if (body.ageGroup !== undefined) updateData.ageGroup = body.ageGroup;
    if (body.imageType !== undefined) updateData.imageType = body.imageType;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    // Handle content update - if content is provided, extract storyTitle from it
    if (body.content !== undefined) {
      updateData.content = body.content;
      // Try to extract story title from content if it exists
      try {
        const contentObj = typeof body.content === 'string'
          ? JSON.parse(body.content)
          : body.content;
        if (contentObj.storyTitle) {
          updateData.storyTitle = contentObj.storyTitle;
        }
      } catch (e) {
        console.warn("Could not extract storyTitle from content:", e);
      }
    }

    // If no valid update fields provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Update the story
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_image: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: "Story updated successfully",
    });
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update story",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
