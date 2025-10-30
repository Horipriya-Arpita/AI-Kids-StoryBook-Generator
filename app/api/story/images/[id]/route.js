import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    // Fetch all images for this story
    const images = await prisma.image.findMany({
      where: { storyId: id },
      orderBy: [
        { isCover: 'desc' }, // Cover image first
        { createdAt: 'asc' }  // Then chapters in order
      ],
    });

    return NextResponse.json({ success: true, images }, { status: 200 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
