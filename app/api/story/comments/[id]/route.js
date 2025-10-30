import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id: storyId } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, oldest, topRated

    // Build orderBy clause
    let orderBy;
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "topRated":
        orderBy = [{ rating: "desc" }, { createdAt: "desc" }];
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch comments for the story
    const comments = await prisma.comment.findMany({
      where: { storyId },
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
      },
      orderBy,
    });

    // Format response
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.user.id,
        username: comment.user.username,
        firstName: comment.user.first_name,
        lastName: comment.user.last_name,
        profileImage: comment.user.profile_image,
      },
    }));

    // Get comment statistics
    const stats = {
      totalComments: comments.length,
      averageRating:
        comments.filter((c) => c.rating).length > 0
          ? comments
              .filter((c) => c.rating)
              .reduce((sum, c) => sum + c.rating, 0) /
            comments.filter((c) => c.rating).length
          : 0,
      ratingBreakdown: {
        5: comments.filter((c) => c.rating === 5).length,
        4: comments.filter((c) => c.rating === 4).length,
        3: comments.filter((c) => c.rating === 3).length,
        2: comments.filter((c) => c.rating === 2).length,
        1: comments.filter((c) => c.rating === 1).length,
      },
    };

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      stats,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch comments",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
