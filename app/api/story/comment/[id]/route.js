import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Profanity filter (basic implementation)
const profanityList = [
  "badword1",
  "badword2",
  // Add more words as needed
];

function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
}

// Update comment
export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { content, rating } = await req.json();

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check for profanity
    if (containsProfanity(content)) {
      return NextResponse.json(
        {
          success: false,
          error: "Your comment contains inappropriate language",
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { story: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        ...(rating !== undefined && { rating }),
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

    // If rating was changed, recalculate story average rating
    if (rating !== undefined && rating !== existingComment.rating) {
      const allComments = await prisma.comment.findMany({
        where: {
          storyId: existingComment.storyId,
          rating: { not: null },
        },
      });

      if (allComments.length > 0) {
        const averageRating =
          allComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) /
          allComments.length;

        await prisma.story.update({
          where: { id: existingComment.storyId },
          data: {
            rating: averageRating,
            ratingCount: allComments.length,
          },
        });
      }
    }

    // Format the response
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      rating: updatedComment.rating,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      author: {
        id: updatedComment.user.id,
        clerk_id: updatedComment.user.clerk_id,
        username: updatedComment.user.username,
        firstName: updatedComment.user.first_name,
        lastName: updatedComment.user.last_name,
        profileImage: updatedComment.user.profile_image,
      },
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// Delete comment
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    const storyId = existingComment.storyId;
    const hadRating = existingComment.rating !== null;

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    // If comment had a rating, recalculate story average rating
    if (hadRating) {
      const remainingComments = await prisma.comment.findMany({
        where: {
          storyId,
          rating: { not: null },
        },
      });

      if (remainingComments.length > 0) {
        const averageRating =
          remainingComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) /
          remainingComments.length;

        await prisma.story.update({
          where: { id: storyId },
          data: {
            rating: averageRating,
            ratingCount: remainingComments.length,
          },
        });
      } else {
        // No ratings left, reset to 0
        await prisma.story.update({
          where: { id: storyId },
          data: {
            rating: 0,
            ratingCount: 0,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
