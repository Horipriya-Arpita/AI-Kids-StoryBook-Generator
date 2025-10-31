import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { clerk_id } = params;

    if (!clerk_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Clerk ID is required",
        },
        { status: 400 }
      );
    }

    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerk_id },
      select: {
        username: true,
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

    return NextResponse.json({
      success: true,
      username: user.username,
    });
  } catch (error) {
    console.error("Error fetching username:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch username",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
