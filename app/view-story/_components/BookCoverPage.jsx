import Image from 'next/image'
import React from 'react'

function BookCoverPage({ imageUrl, title, pageNumber }) {
  return (
    <div className='relative w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 rounded-lg overflow-hidden shadow-2xl'>
      {imageUrl && (
        <div className="absolute inset-0 opacity-40">
          <Image
            src={imageUrl}
            alt="Book Cover"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className='relative h-full flex flex-col items-center justify-center p-10 text-center'>
        <div className='bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm'>
          <h1 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4'>
            {title || "Story Book"}
          </h1>
          <div className='w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-4'></div>
          <p className='text-xl text-gray-700 dark:text-gray-300 font-semibold'>
            A Magical Adventure Awaits
          </p>
        </div>

        <div className='absolute bottom-10 flex flex-col items-center gap-2'>
          <p className='text-white dark:text-gray-200 text-sm font-medium'>
            Open to begin your journey...
          </p>
          {pageNumber !== undefined && (
            <span className='text-white dark:text-gray-300 text-xs bg-black/20 dark:bg-white/10 px-3 py-1 rounded-full'>
              Page {pageNumber + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCoverPage
