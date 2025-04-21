"use client"
import { useState } from 'react'
import Image from 'next/image'
import React from 'react'
//import {story} from 'public/story.jpg'

function StoryType({userSelection}) {

    const optionList = [
        {
            label:'Story Book',
            imageUrl: "/story.jpg",
            isFree: true
        },
        
        {
            label:'Bed Story',
            imageUrl: "/story.jpg",
            isFree: true
        },

        {
            label:'Educational Story',
            imageUrl: "/story.jpg",
            isFree: true
        },

    ]

    const onUserSelect = (item) => {
      setSelectedOption(item.label);
      userSelection({
        fieldValue: item?.label,
        fieldName: 'storyType'
      })
    }
    const [selectedOption, setSelectedOption] = useState("");
    return (
      <div>
        <label className='font-bold text-4xl text-primary'>2. Story Type: </label>
        <div className='grid grid-cols-3 gap-5 mt-3'>
        {optionList.map((item, index) => (
            <div key={index} className={`relative grayscale hover:grayscale-0 cursor-pointer p-1
              ${selectedOption == item.label?'grayscale-0 border-3 rounded-3xl border-primary':'grayscale'}`}
              onClick={()=>onUserSelect(item)}>
              <h2 className='absolute bottom-5 text-white text-3xl font-extrabold text-center w-full'>{item.label}</h2>
              <Image 
                src={item.imageUrl} 
                alt={item.label}
                width={300} 
                height={500}
                className='object-cover h-[260px] rounded-3xl'
              />
            </div>
          ))}
          
        </div>
      </div>
    )
}

export default StoryType
