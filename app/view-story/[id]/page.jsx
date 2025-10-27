"use client";
import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import CommentSection from "@/app/_components/CommentSection";
import { Button } from "@heroui/react";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";

function ViewStory({ params }) {
  const bookRef = useRef();
  const [count, setCount] = useState(0);
  const [storyId, setStoryId] = useState(null);

  // Track view count when story loads
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setStoryId(resolvedParams.id);

      // Track view for this story
      if (resolvedParams.id) {
        fetch(`/api/story/view/${resolvedParams.id}`, {
          method: "POST",
        }).catch((error) => console.error("Error tracking view:", error));
      }
    };

    unwrapParams();
  }, [params]);

  // Hardcoded story data for testing UI/UX
  const storyData = {
    title: "The Magic Garden Adventure",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    chapters: [
      {
        title: "Chapter 1: The Discovery",
        content: "Once upon a time, in a small village surrounded by hills, there lived a curious little girl named Luna. One sunny morning, while playing in her backyard, she discovered a tiny door hidden behind the rose bushes. The door was painted in rainbow colors and sparkled in the sunlight.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"
      },
      {
        title: "Chapter 2: The Secret Path",
        content: "Luna carefully opened the tiny door, and to her amazement, she began to shrink! Soon she was small enough to walk through. On the other side, she found a winding path lined with glowing flowers that chimed like bells when touched. The path led deeper into a magical garden.",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=500&fit=crop"
      },
      {
        title: "Chapter 3: New Friends",
        content: "As Luna walked along the path, she met a friendly talking butterfly named Shimmer. Shimmer had wings that changed colors with every flutter. 'Welcome to the Magic Garden!' said Shimmer. 'I've been waiting for someone brave enough to find this place.'",
        image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&h=500&fit=crop"
      },
      {
        title: "Chapter 4: The Crystal Fountain",
        content: "Shimmer led Luna to a magnificent crystal fountain that sang beautiful melodies. The water sparkled with all the colors of the rainbow. 'This fountain grants one wish to every visitor,' explained Shimmer. Luna thought carefully about what she wanted most in the world.",
        image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=500&fit=crop"
      },
      {
        title: "Chapter 5: The Wish",
        content: "Luna made her wish - not for toys or sweets, but for the ability to share the magic of this garden with all the children in her village. The fountain glowed brightly, and Shimmer smiled. 'Your kind heart has made the garden even more magical,' said the butterfly.",
        image: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=500&h=500&fit=crop"
      },
      {
        title: "Chapter 6: Home Again",
        content: "As the sun began to set, Luna knew it was time to return home. Shimmer gave her a magical seed. 'Plant this in your garden, and the door will always be here for you and your friends,' said Shimmer. Luna returned through the tiny door, growing back to her normal size, excited to share her adventure.",
        image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&h=500&fit=crop"
      }
    ]
  };

  return (
    <div className="p-10 md:px-20 lg:px-40 flex-col min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <h2 className="font-bold text-4xl text-center p-10 bg-primary text-white rounded-xl shadow-lg">
        {storyData.title}
      </h2>

      <div className="relative w-full flex justify-center">
        <HTMLFlipBook
          width={500}
          height={500}
          showCover={true}
          className="mt-10 shadow-2xl"
          useMouseEvents={false}
          ref={bookRef}
        >
          {/* Cover Page */}
          <div>
            <BookCoverPage imageUrl={storyData.coverImage} title={storyData.title} />
          </div>

          {/* Each chapter on one page with image left, text right */}
          {storyData.chapters.map((chapter, index) => (
            <div key={index}>
              <StoryPages storyChapter={chapter} />
            </div>
          ))}
        </HTMLFlipBook>

        {count != 0 && (
          <div
            className="absolute -left-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipPrev();
              setCount(count - 1);
            }}
          >
            <FaArrowAltCircleLeft className="text-[50px] text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
        )}

        {count != storyData.chapters.length && (
          <div
            className="absolute -right-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipNext();
              setCount(count + 1);
            }}
          >
            
            <FaArrowAltCircleRight className="text-[50px] text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="text-lg dark:text-white">
          Page {count + 1} of {storyData.chapters.length + 1}
        </p>
      </div>

      {/* Comments Section */}
      {storyId && (
        <div className="mt-16">
          <CommentSection storyId={storyId} />
        </div>
      )}
    </div>
  );
}

export default ViewStory;
