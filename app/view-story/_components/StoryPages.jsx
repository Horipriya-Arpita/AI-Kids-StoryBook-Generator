import React from "react";
import { FaRegCirclePlay } from "react-icons/fa6";

function StoryPages({ storyChapter }) {

    const text = "There were two farmers in a village, They were best friends. They didn't even think one another without other. One day, they went to the market. They saw a beautiful lady. both of them fall in love with that lady. but they did not tell each other. The next day the both go to the market again and saw that the lady is the Queen of the village."
    
    const playSpeech = (text) => {
        const synth = window?.speechSynthesis;
        const textToSpeech = new SpeechSynthesisUtterance(text);
        synth.speak(textToSpeech);
    }

    return (
        <div>
        <h2 className="text-2xl font-bold text-primary flex justify-between">
            Once Upon a Time there was two farmers
            <span className="text-3xl cursor-pointer"
            onClick={()=>{
                playSpeech(text);
            }}>
            <FaRegCirclePlay />
            </span>
        </h2>
        <span>
            <FaRegCirclePlay />
        </span>
        <p className="text-xl p-10 mt-3 rounded-lg bg-slate-100">
            There were two farmers in a village, They were best friends. They didn't
            even think one another without other. One day, they went to the market.
            They saw a beautiful lady. both of them fall in love with that lady. but
            they did not tell each other. The next day the both go to the market
            again and saw that the lady is the Queen of the village.
        </p>
        </div>
    );
}

export default StoryPages;
