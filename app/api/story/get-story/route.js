import { prisma } from "@/lib/prisma"; // Adjust the path as per your project structure
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("id");

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        images: {
          orderBy: [
            { isCover: 'desc' }, // Cover image first
            { createdAt: 'asc' }  // Then chapters in order
          ],
        },
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

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, story }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
