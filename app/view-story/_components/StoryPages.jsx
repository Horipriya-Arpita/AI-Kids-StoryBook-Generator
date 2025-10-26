import React from "react";
import { FaRegCirclePlay } from "react-icons/fa6";
import Image from "next/image";

function StoryPages({ storyChapter }) {

    const playSpeech = (text) => {
        const synth = window?.speechSynthesis;
        const textToSpeech = new SpeechSynthesisUtterance(text);
        synth.speak(textToSpeech);
    }

    if (!storyChapter) {
        return <div className="w-full h-full bg-gray-100 dark:bg-gray-800"></div>;
    }

    // Different creative shapes for kids book illustrations
    const imageShapes = [
        "rounded-3xl", // Rounded square
        "rounded-full", // Circle
        "rounded-[60% 40% 30% 70%/60% 30% 70% 40%]", // Blob 1
        "rounded-[40% 60% 70% 30%/30% 70% 30% 70%]", // Blob 2
        "rounded-[70% 30% 50% 50%/30% 30% 70% 70%]", // Blob 3
        "rounded-[50% 50% 50% 50%/60% 60% 40% 40%]", // Cloud
        "rounded-[40% 60% 60% 40%/70% 70% 30% 30%]", // Heart-ish
    ];

    // Use chapter title to get consistent shape (not random on every render)
    const getShapeFromTitle = (title) => {
        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return imageShapes[hash % imageShapes.length];
    };

    const shapeClass = getShapeFromTitle(storyChapter.title);

    return (
        <div className="w-full h-full bg-white dark:bg-gray-900 p-6 rounded-lg grid grid-cols-2 gap-4">
            {/* Left Side - Chapter Image */}
            <div className="flex flex-col items-center justify-center">
                {storyChapter.image && (
                    <div className={`relative w-full aspect-square ${shapeClass} border-8 border-purple-400 dark:border-purple-600 overflow-hidden shadow-2xl`}>
                        <Image
                            src={storyChapter.image}
                            alt={storyChapter.title}
                            fill
                            sizes="(max-width: 500px) 100vw, 500px"
                            className="object-cover"
                            priority
                        />
                    </div>
                )}
            </div>

            {/* Right Side - Chapter Title and Content */}
            <div className="flex flex-col justify-start h-full">
                {/* Chapter Title with Audio */}
                <div>
                    <h2 className="text-xl font-bold text-primary dark:text-purple-400 flex justify-between items-start mb-3">
                        <span className="flex-1 leading-tight">{storyChapter.title}</span>
                        <span
                            className="text-2xl cursor-pointer hover:scale-110 transition-transform text-purple-500 dark:text-purple-400 ml-2"
                            onClick={() => {
                                playSpeech(storyChapter.content);
                            }}
                            title="Listen to this chapter"
                        >
                            <FaRegCirclePlay />
                        </span>
                    </h2>

                    {/* Chapter Content - No Scroll */}
                    <div className="mt-2">
                        <p className="text-sm leading-relaxed p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 shadow-inner border-2 border-purple-200 dark:border-purple-700">
                            {storyChapter.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StoryPages;
