"use client"
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("API key is missing! Check your environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "create kids story on description for 5-8 Years kids, Educational story, and all images in Paper cut style: story of boy and Magic School, give me 5 chapter, With detailed image text prompt for each of chapter and image prompt for story cover book with story name, all in JSON field format, avoid normal text, only json\n\n"},
      ],
    },
    {
      role: "model",
      parts: [
        {text: "```json\n{\n  \"storyTitle\": \"Leo and the Lumina Academy\",\n  \"storyCover\": {\n    \"imagePrompt\": \"Book cover illustration: A bright-eyed boy with messy brown hair, 'Leo', standing in front of a whimsical school building made of colorful stacked paper cut shapes, emitting a soft, magical glow. Stars and sparkling swirls float around the building. The title, 'Leo and the Lumina Academy' is written in playful, paper cut-style letters. The background is a deep blue, starry night sky. Paper cut style, vibrant colors, whimsical.\",\n    \"altText\": \"Book cover illustration of Leo and Lumina Academy\"\n  },\n  \"chapters\": [\n    {\n      \"chapterNumber\": 1,\n      \"chapterTitle\": \"The Letter That Sparkled\",\n      \"textContent\": \"Leo loved collecting rocks. Smooth ones, bumpy ones, shiny ones! One ordinary Tuesday, while digging in his backyard, a shimmering envelope tumbled out of the earth. It wasn't like any letter he'd ever seen. It was made of paper that seemed to glow! Inside, a message written in swirling ink invited him to the Lumina Academy, a school for students with… special talents.\",\n      \"imagePrompt\": \"Illustration: Leo, a boy with brown hair and freckles, kneeling in his garden surrounded by rocks. He's holding a glowing, shimmering envelope with wide, surprised eyes. The letter is radiating light. The garden is full of paper cut flowers and trees. Paper cut style, warm lighting, childlike wonder.\",\n      \"altText\": \"Leo finds a glowing letter in his garden.\"\n    },\n    {\n      \"chapterNumber\": 2,\n      \"chapterTitle\": \"Floating on a Cloud Bus\",\n      \"textContent\": \"The instructions in the letter were strange. 'Stand under the oak tree at sunset and wish really, really hard.' Leo did just that. Suddenly, a fluffy, pink cloud materialized! It landed gently, and a friendly squirrel in a conductor's hat beckoned him aboard. The cloud bus bounced gently through the sky, past paper cut stars and smiling moons.\",\n      \"imagePrompt\": \"Illustration: Leo stepping onto a fluffy pink cloud shaped like a bus. A squirrel wearing a conductor's hat is smiling at him. The bus is flying past paper cut stars and crescent moons in a night sky background. Paper cut style, whimsical, vibrant colors.\",\n      \"altText\": \"Leo boarding the cloud bus to Lumina Academy.\"\n    },\n    {\n      \"chapterNumber\": 3,\n      \"chapterTitle\": \"A School Made of Light\",\n      \"textContent\": \"The Lumina Academy was even more magical than Leo imagined! The classrooms were shaped like giant books. The hallways were made of rainbows. And the teachers… one could turn into a butterfly, and another could talk to plants! Leo's first class was 'Color Mixing Alchemy,' where he learned to create light with different shades of paint.\",\n      \"imagePrompt\": \"Illustration: A view of the Lumina Academy: classrooms shaped like giant books, hallways made of rainbows, and a teacher with butterfly wings. In a classroom, Leo is mixing paints, creating glowing colors. Paper cut style, bright and cheerful, fantastical architecture.\",\n      \"altText\": \"Leo exploring the magical Lumina Academy.\"\n    },\n    {\n      \"chapterNumber\": 4,\n      \"chapterTitle\": \"The Mystery of the Missing Star\",\n      \"textContent\": \"One day, a star vanished from the night sky! The teachers were worried. Without the star's light, the Academy's magic was fading. Leo, remembering his love for collecting, volunteered to help. Using his knowledge of rocks and minerals, he realized that a special crystal, the 'Starlight Stone,' was missing from the Academy's observatory.\",\n      \"imagePrompt\": \"Illustration: Leo standing in the observatory, a paper cut room with telescopes and star charts. He looks determined. A star is missing from a constellation depicted on the wall. The colors are slightly muted to show the fading magic. Paper cut style, a sense of mystery, cool colors.\",\n      \"altText\": \"Leo investigates the missing star at Lumina Academy.\"\n    },\n    {\n      \"chapterNumber\": 5,\n      \"chapterTitle\": \"Leo's Shining Talent\",\n      \"textContent\": \"Leo followed a trail of glitter to the school's garden. There, he found a mischievous pixie playing with the Starlight Stone! The pixie explained it just wanted to see the crystal sparkle. Leo, understanding the pixie's curiosity, offered to help it create its own sparkling light using different kinds of rocks and minerals. The pixie happily agreed, and the Starlight Stone was returned, restoring the star's light and the Academy's magic. Leo discovered that his talent wasn't just collecting, but understanding and connecting with others.\",\n      \"imagePrompt\": \"Illustration: Leo and a pixie are in the garden, surrounded by glowing rocks and crystals. The pixie is holding the Starlight Stone. A beam of light shines from the Starlight Stone back into the night sky. Paper cut style, heartwarming, vibrant colors, sense of accomplishment.\",\n      \"altText\": \"Leo helps the pixie and restores the star's light.\"\n    }\n  ]\n}\n```"},
      ],
    },
  ],
});


  