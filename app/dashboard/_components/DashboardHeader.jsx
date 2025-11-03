'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { FaUser } from 'react-icons/fa'

function DashboardHeader() {
    const { user, isSignedIn } = useUser();
    const router = useRouter();
    const [username, setUsername] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchUsername = async () => {
            if (!isSignedIn || !user?.id) return;

            // First try to get username from Clerk user object
            if (user?.username) {
                setUsername(user.username);
                return;
            }

            // Otherwise fetch from our database using the Clerk ID
            try {
                const response = await fetch(`/api/user/get-username/${user.id}`);
                const data = await response.json();

                if (data.success && data.username) {
                    setUsername(data.username);
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        fetchUsername();
    }, [isSignedIn, user?.id, user?.username]);

    const handleViewProfile = () => {
        if (username) {
            router.push(`/profile/${username}`);
        }
    };

    if (!mounted) {
        // Return a placeholder with the same structure during SSR
        return (
            <div className='p-7 bg-primary text-white flex justify-between items-center rounded-xl'>
                <div className='flex items-center gap-4'>
                    <h2 className='font-bold text-3xl'>My Stories</h2>
                </div>
            </div>
        );
    }

    return (
        <div className='p-7 bg-primary text-white flex justify-between items-center rounded-xl'>
            <div className='flex items-center gap-4'>
                <h2 className='font-bold text-3xl'>My Stories</h2>
                {username && (
                    <Button
                        as="button"
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<FaUser />}
                        onPress={handleViewProfile}
                    >
                        View My Public Profile
                    </Button>
                )}
            </div>
        </div>
    )
}

export default DashboardHeader
