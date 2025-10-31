"use client"
import {HeroUIProvider} from '@heroui/react'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './_components/Header'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export function Providers({children}) {
  return (

    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
      <HeroUIProvider>
      <Toaster position="top-right" />
      <Header/>
      {children}
      </HeroUIProvider>
      </ThemeProvider>
    </ClerkProvider>

  )
}