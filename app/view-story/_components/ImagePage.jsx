import React from "react";
import Image from "next/image";

function ImagePage({ imageUrl, chapterTitle }) {
    if (!imageUrl) {
        return <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>;
    }

    // Different creative shapes for kids book illustrations
    const imageShapes = [
        // Rounded square
        "rounded-3xl",
        // Circle
        "rounded-full",
        // Organic blob shapes
        "rounded-[60% 40% 30% 70%/60% 30% 70% 40%]",
        "rounded-[40% 60% 70% 30%/30% 70% 30% 70%]",
        "rounded-[70% 30% 50% 50%/30% 30% 70% 70%]",
        // Cloud-like shape
        "rounded-[50% 50% 50% 50%/60% 60% 40% 40%]",
        // Heart-ish shape
        "rounded-[40% 60% 60% 40%/70% 70% 30% 30%]",
    ];

    // Use a stable random selection based on chapter title
    const getShapeFromTitle = (seed) => {
        const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return imageShapes[hash % imageShapes.length];
    };

    const shapeClass = getShapeFromTitle(chapterTitle || 'default');

    return (
        <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-10 flex items-center justify-center">
            <div className={`relative w-[80%] h-[80%] ${shapeClass} border-8 border-purple-400 dark:border-purple-600 overflow-hidden shadow-2xl`}>
                <Image
                    src={imageUrl}
                    alt={chapterTitle || "Chapter image"}
                    fill
                    sizes="(max-width: 500px) 100vw, 500px"
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}

export default ImagePage;
