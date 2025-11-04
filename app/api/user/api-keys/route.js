import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

// GET: Fetch user's API key status and usage stats
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
        apiKeys: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return sanitized data (don't send actual keys to frontend)
    return NextResponse.json({
      freeStoriesUsed: user.freeStoriesUsed,
      freeStoryLimit: user.freeStoryLimit,
      hasGeminiKey: !!user.apiKeys?.geminiApiKey,
      hasHuggingFaceKey: !!user.apiKeys?.huggingFaceApiKey,
      isActive: user.apiKeys?.isActive || false,
      lastValidated: user.apiKeys?.lastValidated || null,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST: Save/Update user's API keys
export async function POST(req) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { geminiApiKey, huggingFaceApiKey } = await req.json();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Encrypt the API keys
    const encryptedGemini = geminiApiKey ? encrypt(geminiApiKey) : null;
    const encryptedHuggingFace = huggingFaceApiKey
      ? encrypt(huggingFaceApiKey)
      : null;

    // Upsert API keys (create or update)
    const apiKeys = await prisma.userApiKeys.upsert({
      where: { userId: user.id },
      update: {
        ...(encryptedGemini && { geminiApiKey: encryptedGemini }),
        ...(encryptedHuggingFace && {
          huggingFaceApiKey: encryptedHuggingFace,
        }),
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        geminiApiKey: encryptedGemini,
        huggingFaceApiKey: encryptedHuggingFace,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "API keys saved successfully",
      hasGeminiKey: !!apiKeys.geminiApiKey,
      hasHuggingFaceKey: !!apiKeys.huggingFaceApiKey,
    });
  } catch (error) {
    console.error("Error saving API keys:", error);
    return NextResponse.json(
      { error: "Failed to save API keys" },
      { status: 500 }
    );
  }
}

// DELETE: Remove user's API keys
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete API keys
    await prisma.userApiKeys.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "API keys deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API keys:", error);
    return NextResponse.json(
      { error: "Failed to delete API keys" },
      { status: 500 }
    );
  }
}
