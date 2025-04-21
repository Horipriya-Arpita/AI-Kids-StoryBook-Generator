import { prisma } from "@/lib/prisma"; // Adjust the path as per your project structure
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    console.log("hittedddd....");
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("id");

    console.log(storyId,">>>>>");
    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, story }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
