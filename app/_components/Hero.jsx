import { Button } from '@heroui/react'
import Image from 'next/image'
import React from 'react'
import logo from '../../public/logo.png';
import Link from 'next/link';

function Hero() {
  return (
    <div className='px-10 md:px-20 lg:px-44 mt-10 h-screen'>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <div>
          <h2 className='text-[70px] text-primary font-extrabold py-10'>Craft Magical Stories for kids in Minutes</h2>
          <div className='text-3xl text-primary font-bold'>Create fun and personalised stories that bring your child's adventures to life and spark their passion for reading. It only takes a few seconds!</div>
          <Link href={'/create-story'}>
          <Button color='primary' className='mt-10 font-bold text-2xl p-8'>Create Story </Button>
          </Link>        
        </div>

        <div>
          <Image src='/logo.png' alt='Hero' width={700} height={400}/>
        </div>
      </div>
    </div>
  )
}

export default Hero
