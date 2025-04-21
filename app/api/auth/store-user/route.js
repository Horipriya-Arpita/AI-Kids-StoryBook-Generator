import { getAuth} from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).then((res) => res.json());

    const { id: clerk_id, email_addresses, first_name, last_name, image_url, username } = clerkUser;


    // Check if user already exists in MySQL
    let user = await prisma.user.findUnique({ where: { clerk_id } });

    if (!user) {
      // Create new user in MySQL
      user = await prisma.user.create({
        data: {
          clerk_id,
          email: email_addresses?.[0]?.email_address || "",
          username: username || null,
          first_name: first_name || null,
          last_name: last_name || null,
          profile_image: image_url || null,
        },
      });
    }

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// export async function GET() {
//   try {
//     const { userId } = auth(); // Get Clerk User ID
//     console.log(userId, "...........");
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     //Fetch full user data from Clerk
//     const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
//       headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
//     }).then((res) => res.json());

//     const { id, email_addresses, first_name, last_name, image_url } = clerkUser;

//     // Check if user already exists in MySQL
//     let user = await prisma.user.findUnique({ where: { clerkId: id } });

//     if (!user) {
//       // Create new user in MySQL
//       user = await prisma.user.create({
//         data: {
//           clerkId: id,
//           email: email_addresses[0]?.email_address || "",
//           name: `${first_name || ""} ${last_name || ""}`.trim(),
//           imageUrl: image_url,
//         },
//       });
//     }

//     return NextResponse.json({ success: true, userId });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }