"use client"
import React from 'react'
import { useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import DashboardHeader from './_components/DashboardHeader';

function Dashboard() {
  const { userId } = useAuth();
 //console.log(userId, typeof(userId), "User ID in frontend");

  useEffect(() => {
    fetch("/api/auth/store-user").catch((err) => console.error("User sync failed:", err));
  }, []);

  return (
    <div className='p-10 md:px-20 lg:px-20 lg:px-40 min-h-screen'>
      <DashboardHeader/>
    </div>
  )
}

export default Dashboard
