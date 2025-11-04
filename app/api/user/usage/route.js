import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch user's usage statistics
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
      include: {
        stories: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        apiKeys: {
          select: {
            geminiApiKey: true,
            huggingFaceApiKey: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasCustomKeys = !!(
      user.apiKeys?.geminiApiKey && user.apiKeys?.huggingFaceApiKey
    );

    // Calculate remaining free stories
    const remainingFreeStories = Math.max(
      0,
      user.freeStoryLimit - user.freeStoriesUsed
    );

    return NextResponse.json({
      freeStoriesUsed: user.freeStoriesUsed,
      freeStoryLimit: user.freeStoryLimit,
      remainingFreeStories,
      totalStories: user.stories.length,
      hasCustomKeys,
      canCreateStory: hasCustomKeys || remainingFreeStories > 0,
      reachedLimit: !hasCustomKeys && remainingFreeStories === 0,
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
