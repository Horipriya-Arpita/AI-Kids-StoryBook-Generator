
//{storySubject} {storyType} {ageGroup} {imageType}

export const AI_Prompt = `create kids story on description for {ageGroup} kids, {storyType} story, and all images in {imageType} style: {storySubject}, give me 5 chapters, With detailed image text prompt for each of chapter and image prompt for story cover book with story name. Return ONLY valid JSON in this exact format:
{
  "storyTitle": "story title here",
  "storyCover": {
    "imagePrompt": "detailed image prompt for cover in {imageType} style"
  },
  "chapters": [
    {
      "chapterNumber": 1,
      "chapterTitle": "chapter title",
      "textContent": "detailed chapter story text here (at least 100-150 words with 2-3 paragraphs)",
      "imagePrompt": "detailed image prompt for this chapter in {imageType} style"
    }
  ]
}
Important: Each chapter's "textContent" field must contain the actual story narrative for that chapter (100-150 words). Make the story engaging and age-appropriate for {ageGroup} kids. Avoid any text outside JSON, only return valid JSON.`;

export const AI_Prompt_random = "create kids story on description for 5-8 Years kids, Educational story, and all images in Paper cut style: story of boy and Magic School, give me 5 chapter, With detailed image text prompt for each of chapter and image prompt for story cover book with story name, all in JSON field format, avoid normal text, only json";

