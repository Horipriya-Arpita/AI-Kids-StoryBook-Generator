import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json(
        { success: false, error: "Story ID is required" },
        { status: 400 }
      );
    }

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

    // Check if user already liked this story
    const existingLike = await prisma.like.findUnique({
      where: {
        storyId_userId: {
          storyId: storyId,
          userId: dbUser.id,
        },
      },
    });

    let action;
    let newLikeCount;

    if (existingLike) {
      // Unlike: Delete the like and decrement counter
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.story.update({
          where: { id: storyId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        }),
      ]);
      action = "unliked";
      newLikeCount = story.likeCount - 1;
    } else {
      // Like: Create the like and increment counter
      await prisma.$transaction([
        prisma.like.create({
          data: {
            storyId: storyId,
            userId: dbUser.id,
          },
        }),
        prisma.story.update({
          where: { id: storyId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        }),
      ]);
      action = "liked";
      newLikeCount = story.likeCount + 1;
    }

    return NextResponse.json({
      success: true,
      action,
      likeCount: newLikeCount,
      isLiked: action === "liked",
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle like",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
