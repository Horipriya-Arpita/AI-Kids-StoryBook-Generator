"use client";
import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import { Button } from "@heroui/button";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";

function ViewStory({ params }) {
  useEffect(() => {
    console.log(params.id, "ppppppppp");
  }, []);

  const bookRef = useRef();
  const [count, setCount] = useState(0);

  return (
    <div className="p-10 md:px-20 lg:px-40 flex-col">
      <h2 className="font-bold text-4xl text-center p-10 bg-primary text-white">
        Two Friends in a village
      </h2>

      <div className="relative w-full">
        <HTMLFlipBook
          width={500}
          height={500}
          showCover={true}
          className="mt-10"
          useMouseEvents={false}
          ref={bookRef}
        >
          <div>
            <BookCoverPage imageUrl={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>

          <div>
            <StoryPages storyChapter={null} />
          </div>
        </HTMLFlipBook>

        {count != 0 && (
          <div
            className="absolute -left-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipPrev();
              setCount(count - 1);
            }}
          >
            <FaArrowAltCircleLeft className="text-[50px] text-primary cursor-pointer" />
          </div>
        )}

        {count != 5 && (
          <div
            className="absolute -right-5 top-[250px]"
            onClick={() => {
              bookRef.current.pageFlip().flipNext();
              setCount(count + 1);
            }}
          >
            <FaArrowAltCircleRight className="text-[50px] text-primary cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewStory;
