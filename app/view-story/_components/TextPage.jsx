import React from "react";
import { FaRegCirclePlay } from "react-icons/fa6";

function TextPage({ chapterTitle, chapterContent }) {
    const playSpeech = (text) => {
        if (!text) return;
        const synth = window?.speechSynthesis;
        const textToSpeech = new SpeechSynthesisUtterance(text);
        synth.speak(textToSpeech);
    }

    if (!chapterTitle || !chapterContent) {
        return <div className="w-full h-full bg-white dark:bg-gray-900"></div>;
    }

    return (
        <div className="w-full h-full bg-white dark:bg-gray-900 p-12 flex flex-col justify-start relative">
            {/* Chapter Title with Audio */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-primary dark:text-purple-400 leading-tight flex-1">
                        {chapterTitle}
                    </h2>
                    <button
                        className="text-3xl cursor-pointer hover:scale-110 transition-transform text-purple-500 dark:text-purple-400 ml-4 flex-shrink-0"
                        onClick={() => playSpeech(chapterContent)}
                        title="Listen to this chapter"
                    >
                        <FaRegCirclePlay />
                    </button>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>

            {/* Chapter Content */}
            <div className="flex-1">
                <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                    {chapterContent}
                </p>
            </div>
        </div>
    );
}

export default TextPage;
