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

    const { id: storyId } = params;
    const { isPublic } = await request.json();

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isPublic must be a boolean value" },
        { status: 400 }
      );
    }

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
          error: "You don't have permission to modify this story",
        },
        { status: 403 }
      );
    }

    // Update story privacy
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: { isPublic },
    });

    return NextResponse.json({
      success: true,
      story: {
        id: updatedStory.id,
        isPublic: updatedStory.isPublic,
      },
      message: isPublic
        ? "Story is now public and visible to everyone!"
        : "Story is now private and only visible to you.",
    });
  } catch (error) {
    console.error("Error updating story privacy:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update story privacy",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
