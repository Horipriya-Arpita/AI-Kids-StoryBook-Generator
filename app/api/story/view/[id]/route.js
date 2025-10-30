import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { id: storyId } = await params;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    // Increment view count
    const updatedStory = await prisma.story.update({
      where: { id: storyId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      viewCount: updatedStory.viewCount,
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track view",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
