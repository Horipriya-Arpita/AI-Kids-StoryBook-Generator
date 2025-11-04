import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// POST: Validate an API key by testing it
export async function POST(req) {
  try {
    const { apiKey, provider } = await req.json();

    if (!apiKey || !provider) {
      return NextResponse.json(
        { error: "API key and provider are required" },
        { status: 400 }
      );
    }

    let isValid = false;
    let errorMessage = "";

    if (provider === "gemini") {
      // Test Gemini API key by checking format and making a lightweight request
      try {
        // Basic format validation - Gemini keys start with "AIza" and are 39 characters
        if (!apiKey.startsWith("AIza") || apiKey.length !== 39) {
          errorMessage = "Invalid Gemini API key format. Keys should start with 'AIza' and be 39 characters long.";
          isValid = false;
        } else {
          // Try to initialize the client and make a test request
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          // Very lightweight test - just "hi"
          const result = await model.generateContent("hi");
          const response = await result.response;
          const text = response.text();

          isValid = !!text; // If we get a response, key is valid
        }
      } catch (error) {
        console.error("Gemini validation error:", error);

        // Handle specific error codes
        if (error.status === 429) {
          // Rate limit means the key is valid, just too many requests
          isValid = true;
          errorMessage = "API key is valid (rate limited - this is normal)";
        } else if (error.status === 401 || error.status === 403 || error.message?.includes("API_KEY_INVALID")) {
          // Invalid key
          errorMessage = "Invalid Gemini API key. Please check your key and try again.";
          isValid = false;
        } else {
          // Other errors - assume key is valid but something else went wrong
          isValid = true;
          errorMessage = "API key format is valid (unable to fully test due to rate limits)";
        }
      }
    } else if (provider === "huggingface") {
      // Test HuggingFace API key
      try {
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: "test",
            }),
          }
        );

        // HuggingFace returns 200 even if model is loading, check for auth errors
        if (response.status === 401 || response.status === 403) {
          errorMessage = "Invalid HuggingFace API key";
          isValid = false;
        } else {
          isValid = true;
        }
      } catch (error) {
        console.error("HuggingFace validation error:", error);
        errorMessage = error.message || "Invalid HuggingFace API key";
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid,
      message: errorMessage || (isValid
        ? `${provider} API key is valid`
        : `Invalid ${provider} API key`),
    });
  } catch (error) {
    console.error("Error validating API key:", error);
    return NextResponse.json(
      { error: "Failed to validate API key" },
      { status: 500 }
    );
  }
}
