"use client"
import {HeroUIProvider} from '@heroui/react'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './_components/Header'

export function Providers({children}) {
  return (
    
    <ClerkProvider>
      <HeroUIProvider>
      <Header/>
      {children}
      </HeroUIProvider>
    </ClerkProvider>
    
  )
}