import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const clerkUser = await currentUser();
    const { searchParams } = new URL(request.url);

    // Get the internal user ID from database if clerk user exists
    let dbUser = null;
    if (clerkUser) {
      dbUser = await prisma.user.findUnique({
        where: { clerk_id: clerkUser.id },
        select: { id: true },
      });
    }
    const userId = dbUser?.id;

    // Extract query parameters
    const search = searchParams.get("search") || "";
    const storyType = searchParams.get("storyType") || "";
    const ageGroup = searchParams.get("ageGroup") || "";
    const imageType = searchParams.get("imageType") || "";
    const sortBy = searchParams.get("sortBy") || "recent";
    const privacy = searchParams.get("privacy") || "all"; // all, public, myStories, favorites
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where = {
      AND: [
        // Privacy filter
        privacy === "myStories" && userId
          ? { userId: userId }
          : privacy === "public"
          ? { isPublic: true }
          : privacy === "favorites" && userId
          ? {
              likes: {
                some: {
                  userId: userId,
                },
              },
            }
          : {
              OR: [
                { isPublic: true },
                userId ? { userId: userId } : {},
              ],
            },

        // Search filter
        search
          ? {
              OR: [
                { storySubject: { contains: search } },
                { storyTitle: { contains: search } },
              ],
            }
          : {},

        // Story type filter
        storyType ? { storyType } : {},

        // Age group filter
        ageGroup ? { ageGroup } : {},

        // Image type filter
        imageType ? { imageType } : {},
      ],
    };

    // Build orderBy clause for sorting
    let orderBy;
    switch (sortBy) {
      case "popular":
        // Most liked stories
        orderBy = { likeCount: "desc" };
        break;
      case "trending":
        // Combination of views and likes (recent activity)
        orderBy = [
          { likeCount: "desc" },
          { viewCount: "desc" },
          { createdAt: "desc" },
        ];
        break;
      case "mostViewed":
        orderBy = { viewCount: "desc" };
        break;
      case "topRated":
        orderBy = [{ rating: "desc" }, { ratingCount: "desc" }];
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch stories with pagination
    const [stories, totalCount] = await Promise.all([
      prisma.story.findMany({
        where,
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
          images: {
            where: { isCover: true },
            take: 1,
          },
          likes: userId
            ? {
                where: { userId: userId },
                select: { id: true },
              }
            : false,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.story.count({ where }),
    ]);

    // Format response
    const formattedStories = stories.map((story) => ({
      id: story.id,
      storySubject: story.storySubject,
      storyType: story.storyType,
      ageGroup: story.ageGroup,
      imageType: story.imageType,
      title: story.content?.storyTitle || "Untitled Story",
      coverImage: story.images[0]?.imageUrl || "/placeholder-cover.jpg",
      isPublic: story.isPublic,
      viewCount: story.viewCount,
      likeCount: story.likeCount,
      rating: story.rating,
      ratingCount: story.ratingCount,
      commentCount: story._count.comments,
      createdAt: story.createdAt,
      author: {
        id: story.user.id,
        username: story.user.username,
        firstName: story.user.first_name,
        lastName: story.user.last_name,
        profileImage: story.user.profile_image,
      },
      isLikedByUser: userId ? story.likes?.length > 0 : false,
      isOwnStory: userId ? story.userId === userId : false,
    }));

    return NextResponse.json({
      success: true,
      stories: formattedStories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stories",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
