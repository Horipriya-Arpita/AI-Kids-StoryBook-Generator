"use client"
import {HeroUIProvider} from '@heroui/react'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './_components/Header'
import { ThemeProvider } from 'next-themes'

export function Providers({children}) {
  return (

    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
      <HeroUIProvider>
      <Header/>
      {children}
      </HeroUIProvider>
      </ThemeProvider>
    </ClerkProvider>

  )
}