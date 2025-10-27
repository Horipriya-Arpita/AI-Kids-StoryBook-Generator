"use client";

import { Card, CardBody, Chip, Button } from "@heroui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaHeart, FaEye, FaStar } from "react-icons/fa";

export default function TrendingCarousel({ stories }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || stories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, stories.length]);

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handleViewStory = (storyId) => {
    router.push(`/view-story/${storyId}`);
  };

  if (!stories || stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="relative w-full mb-8">
      {/* Hero Card */}
      <Card className="w-full h-96 overflow-hidden">
        <CardBody className="p-0">
          <div className="relative w-full h-full">
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentStory.coverImage})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
              <div className="max-w-2xl">
                <Chip
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="mb-3"
                >
                  Trending Now
                </Chip>

                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">
                  {currentStory.title}
                </h2>

                <p className="text-lg mb-4 line-clamp-2 drop-shadow">
                  {currentStory.storySubject}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    <span>{currentStory.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEye />
                    <span>{currentStory.viewCount}</span>
                  </div>
                  {currentStory.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span>{currentStory.rating.toFixed(1)} / 5</span>
                    </div>
                  )}
                  <Chip size="sm" color="primary" variant="flat">
                    {currentStory.ageGroup}
                  </Chip>
                </div>

                <Button
                  color="primary"
                  size="lg"
                  onPress={() => handleViewStory(currentStory.id)}
                >
                  Read Story
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            {stories.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
                  aria-label="Previous story"
                >
                  <FaChevronLeft className="text-white text-xl" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
                  aria-label="Next story"
                >
                  <FaChevronRight className="text-white text-xl" />
                </button>
              </>
            )}

            {/* Indicators */}
            {stories.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {stories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAutoPlay(false);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
