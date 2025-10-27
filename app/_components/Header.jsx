"use client"
import React from 'react'
import {  Navbar,   NavbarBrand,   NavbarContent,   NavbarItem,   NavbarMenuToggle,  NavbarMenu,  NavbarMenuItem, Button} from "@heroui/react";
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { UserButton, useUser } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

function Header() {

    const {user, isSignedIn} = useUser();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    
    const MenuList = [
      {
        name: 'Home',
        path: '/'
      },

      {
        name: 'Create Story',
        path: '/create-story'
      },

      {
        name: 'Explore Stories',
        path: '/explore'
      },

      {
        name: 'Contact Us',
        path: '/contact'
      },
    ]

    return (
    
      <Navbar maxWidth='full' isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>

        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
        </NavbarContent>

        <NavbarContent justify='start'>
          <NavbarBrand>
            <Image src='/logo.png' alt='logo' width={40} height={40}/>
            <h2 className='font-extrabold text-2xl text-primary ml-3'>Kids Story </h2>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify='center'>
          {MenuList.map((item, index)=>(
            <NavbarItem key={index} className='text-xl text-primary font-medium mx-2 hover:underline'>
              <Link href={item.path}>
                {item.name}
              </Link>
            </NavbarItem>
          ))}

        </NavbarContent>


        <NavbarContent justify='end'>
          {mounted && (
            <Button
              isIconOnly
              variant="light"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-2xl"
            >
              {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
            </Button>
          )}
          <Link href={'/dashboard'}>
          <Button color='primary'>
            {isSignedIn?
            "Dashboard":
            "Get Started"}
          </Button>
          </Link>
          <div className='border-5 rounded-3xl border-primary flex justify-center'>
          <UserButton/>
          </div>

        </NavbarContent>

        <NavbarMenu>
        {MenuList.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2 ? "warning" : index === MenuList.length - 1 ? "danger" : "foreground"
              }
              href={item.path}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

      </Navbar>
    
    )
}

export default Header;
