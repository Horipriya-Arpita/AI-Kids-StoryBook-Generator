"use client"
import { useState } from 'react'
import Image from 'next/image'
import React from 'react'

function ImageStyle({userSelection}) {
    const optionList = [
        {
            label:'3D Cartton',
            imageUrl: "/story.jpg",
            isFree: true
        },
        
        {
            label:'Paper Cut',
            imageUrl: "/story.jpg",
            isFree: true
        },

        {
            label:'Water Color',
            imageUrl: "/story.jpg",
            isFree: true
        },

        {
            label:'Pixel Style',
            imageUrl: "/story.jpg",
            isFree: true
        },

    ]

    const onUserSelect = (item) => {
      setSelectedOption(item.label);
      userSelection({
        fieldValue: item?.label,
        fieldName: 'imageType'
      })
    }

    const [selectedOption, setSelectedOption] = useState("");
    return (
      <div>
        <label className='font-bold text-4xl text-primary'>4. Image Style: </label>
        <div className='grid grid-cols-2 gap-5 mt-3'>
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
                className='object-cover h-[120px] rounded-3xl'
              />
            </div>
          ))}
          
        </div>
      </div>
    )
}

export default ImageStyle
