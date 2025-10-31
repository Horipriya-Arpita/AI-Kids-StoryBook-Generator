import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Simple profanity filter (you can use a library like 'bad-words' for better filtering)
const profanityWords = [
  "badword1",
  "badword2",
  // Add more as needed or use a library
];

function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return profanityWords.some((word) => lowerText.includes(word));
}

export async function POST(request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { storyId, content, rating } = await request.json();

    // Validation
    if (!storyId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Story ID and content are required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Content moderation check
    if (containsProfanity(content)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your comment contains inappropriate language. Please keep it kid-friendly!",
        },
        { status: 400 }
      );
    }

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        comments: {
          where: { rating: { not: null } },
          select: { rating: true },
        },
      },
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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        storyId,
        userId: dbUser.id,
        content: content.trim(),
        rating: rating || null,
      },
      include: {
        user: {
          select: {
            id: true,
            clerk_id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_image: true,
          },
        },
      },
    });

    // Update story rating if rating was provided
    if (rating) {
      const allRatings = [...story.comments.map((c) => c.rating), rating];
      const avgRating =
        allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

      await prisma.story.update({
        where: { id: storyId },
        data: {
          rating: avgRating,
          ratingCount: allRatings.length,
        },
      });
    }

    // Format response
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.createdAt,
      author: {
        id: comment.user.id,
        clerkId: comment.user.clerk_id,
        username: comment.user.username,
        firstName: comment.user.first_name,
        lastName: comment.user.last_name,
        profileImage: comment.user.profile_image,
      },
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create comment",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
