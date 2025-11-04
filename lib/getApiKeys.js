// Helper function to get user's API keys from server
export async function getUserApiKeys() {
  try {
    const response = await fetch('/api/user/api-keys');
    if (!response.ok) {
      console.error('Failed to fetch API keys');
      return { hasGeminiKey: false, hasHuggingFaceKey: false };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return { hasGeminiKey: false, hasHuggingFaceKey: false };
  }
}

// Helper function to get API key for usage (decrypted on server)
export async function getGeminiApiKey() {
  const apiKeyData = await getUserApiKeys();

  if (apiKeyData.hasGeminiKey && apiKeyData.hasHuggingFaceKey) {
    // User has custom keys, but we can't return the actual key (it's encrypted)
    // The story creation will need to handle this on the backend
    return {
      useCustomKey: true,
      systemKey: null,
    };
  }

  // Use system key
  return {
    useCustomKey: false,
    systemKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  };
}
