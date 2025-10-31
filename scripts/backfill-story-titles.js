/**
 * Backfill script to populate storyTitle field for existing stories
 * Run this once after adding the storyTitle field to your schema
 *
 * Usage: node scripts/backfill-story-titles.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function backfillStoryTitles() {
  try {
    console.log("🔄 Starting story title backfill...");

    // Fetch all stories without a storyTitle
    const stories = await prisma.story.findMany({
      where: {
        storyTitle: null,
      },
      select: {
        id: true,
        content: true,
      },
    });

    console.log(`📊 Found ${stories.length} stories to update`);

    if (stories.length === 0) {
      console.log("✅ All stories already have titles!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Update each story
    for (const story of stories) {
      try {
        // Parse the content JSON
        const content = typeof story.content === 'string'
          ? JSON.parse(story.content)
          : story.content;

        // Extract the story title
        const storyTitle = content.storyTitle || "Untitled Story";

        // Update the story with the title
        await prisma.story.update({
          where: { id: story.id },
          data: { storyTitle },
        });

        successCount++;
        console.log(`✅ Updated story ${story.id}: "${storyTitle}"`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to update story ${story.id}:`, error.message);
      }
    }

    console.log("\n📈 Backfill Summary:");
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total processed: ${stories.length}`);

    if (successCount === stories.length) {
      console.log("\n🎉 All stories updated successfully!");
    }
  } catch (error) {
    console.error("💥 Fatal error during backfill:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillStoryTitles();
