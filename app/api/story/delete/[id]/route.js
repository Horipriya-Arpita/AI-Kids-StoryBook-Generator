import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: storyId } = await params;

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
      include: {
        images: true,
      },
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
          error: "You don't have permission to delete this story",
        },
        { status: 403 }
      );
    }

    // Delete the story (this will cascade delete likes and comments automatically)
    // We also need to manually delete images since they don't have cascade delete in schema
    await prisma.$transaction([
      // Delete all images associated with this story
      prisma.image.deleteMany({
        where: { storyId },
      }),
      // Delete the story (likes and comments will cascade delete automatically)
      prisma.story.delete({
        where: { id: storyId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete story",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
