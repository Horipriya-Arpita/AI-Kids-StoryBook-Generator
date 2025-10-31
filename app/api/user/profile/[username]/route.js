import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Username is required",
        },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        profile_image: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Fetch user's public stories with pagination
    const page = parseInt(new URL(request.url).searchParams.get("page") || "1");
    const limit = parseInt(new URL(request.url).searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [stories, totalStories] = await Promise.all([
      prisma.story.findMany({
        where: {
          userId: user.id,
          isPublic: true,
        },
        include: {
          images: {
            where: { isCover: true },
            take: 1,
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.story.count({
        where: {
          userId: user.id,
          isPublic: true,
        },
      }),
    ]);

    // Calculate aggregate statistics
    const stats = await prisma.story.aggregate({
      where: {
        userId: user.id,
        isPublic: true,
      },
      _sum: {
        likeCount: true,
        viewCount: true,
      },
      _count: {
        id: true,
      },
    });

    // Format stories
    const formattedStories = stories.map((story) => ({
      id: story.id,
      storySubject: story.storySubject,
      storyType: story.storyType,
      ageGroup: story.ageGroup,
      imageType: story.imageType,
      title: story.content?.storyTitle || "Untitled Story",
      coverImage: story.images[0]?.imageUrl || "/placeholder-cover.jpg",
      viewCount: story.viewCount,
      likeCount: story.likeCount,
      rating: story.rating,
      ratingCount: story.ratingCount,
      commentCount: story._count.comments,
      createdAt: story.createdAt,
    }));

    return NextResponse.json({
      success: true,
      profile: {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
        memberSince: user.created_at,
        stats: {
          totalStories: stats._count.id || 0,
          totalLikes: stats._sum.likeCount || 0,
          totalViews: stats._sum.viewCount || 0,
        },
      },
      stories: formattedStories,
      pagination: {
        page,
        limit,
        totalCount: totalStories,
        totalPages: Math.ceil(totalStories / limit),
        hasMore: page * limit < totalStories,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user profile",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
