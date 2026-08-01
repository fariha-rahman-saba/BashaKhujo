import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c45772?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80",
];

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 12);

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.report.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const seeker = await prisma.user.create({
    data: {
      name: "Rahim Ahmed",
      email: "seeker@demo.com",
      passwordHash,
      role: "SEEKER",
      phone: "01712345678",
    },
  });

  const lister1 = await prisma.user.create({
    data: {
      name: "Karim Hassan",
      email: "lister@demo.com",
      passwordHash,
      role: "LISTER",
      phone: "01812345678",
      nidVerified: true,
      avgRating: 4.5,
    },
  });

  const lister2 = await prisma.user.create({
    data: {
      name: "Fatima Begum",
      email: "lister2@demo.com",
      passwordHash,
      role: "LISTER",
      phone: "01912345678",
      nidVerified: true,
      avgRating: 4.8,
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const listingsData = [
    {
      listerId: lister1.id,
      title: "Cozy Bachelor Room in Mirpur 10",
      description:
        "Fully furnished single room perfect for working professionals. Includes WiFi, shared kitchen, and 24/7 security. Near Mirpur 10 circle, 5 min walk to bus stand. Bachelor friendly with separate entrance.",
      rent: 8000,
      areaName: "Mirpur",
      latitude: 23.8223,
      longitude: 90.3654,
      roomType: "SINGLE_ROOM" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[0], PLACEHOLDER_PHOTOS[1]],
    },
    {
      listerId: lister1.id,
      title: "Shared Flat Sublet — Uttara Sector 7",
      description:
        "One room available in a 3BHK flat shared with 2 other professionals. AC, geyser, lift, generator backup. Close to Uttara North metro station. Ideal for IT professionals.",
      rent: 12000,
      areaName: "Uttara",
      latitude: 23.8759,
      longitude: 90.3795,
      roomType: "SUBLET" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[2]],
    },
    {
      listerId: lister2.id,
      title: "Full Flat for Bachelor — Mohammadpur",
      description:
        "2 bedroom flat on 4th floor with balcony. Semi-furnished with beds, wardrobe, and kitchen setup. Quiet neighborhood, near Shyamoli. Perfect for 2 friends sharing.",
      rent: 18000,
      areaName: "Mohammadpur",
      latitude: 23.7639,
      longitude: 90.3606,
      roomType: "FULL_FLAT" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[3], PLACEHOLDER_PHOTOS[4]],
    },
    {
      listerId: lister2.id,
      title: "Budget Room near Dhanmondi Lake",
      description:
        "Affordable single room in a peaceful area. Shared bathroom, electricity included. 10 minutes from Dhanmondi Lake. Great for students and early-career professionals.",
      rent: 6500,
      areaName: "Dhanmondi",
      latitude: 23.7465,
      longitude: 90.376,
      roomType: "SINGLE_ROOM" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[5]],
    },
    {
      listerId: lister1.id,
      title: "Premium Room in Gulshan 2",
      description:
        "High-end furnished room with attached bathroom. Building has gym, rooftop, and parking. 24/7 CCTV. Best for corporate professionals working in Gulshan/Banani area.",
      rent: 25000,
      areaName: "Gulshan",
      latitude: 23.7925,
      longitude: 90.4078,
      roomType: "SINGLE_ROOM" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[0], PLACEHOLDER_PHOTOS[2]],
    },
    {
      listerId: lister2.id,
      title: "Room in Bashundhara R/A",
      description:
        "Clean and bright room in a gated community. Generator, lift, security. Near Jamuna Future Park. Bachelor friendly with house rules. Available from next month.",
      rent: 10000,
      areaName: "Bashundhara",
      latitude: 23.8159,
      longitude: 90.4264,
      roomType: "SINGLE_ROOM" as const,
      bachelorFriendly: true,
      photos: [PLACEHOLDER_PHOTOS[1], PLACEHOLDER_PHOTOS[3]],
    },
  ];

  const listings = [];
  for (const data of listingsData) {
    const listing = await prisma.listing.create({ data });
    listings.push(listing);
  }

  await prisma.review.create({
    data: {
      reviewerId: seeker.id,
      revieweeId: lister1.id,
      listingId: listings[0].id,
      rating: 5,
      comment: "Very honest and helpful landlord. Room was exactly as described.",
    },
  });

  await prisma.review.create({
    data: {
      reviewerId: seeker.id,
      revieweeId: lister2.id,
      listingId: listings[2].id,
      rating: 4,
      comment: "Good flat, responsive owner. Slightly far from main road.",
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      listingId: listings[0].id,
      seekerId: seeker.id,
      listerId: lister1.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: seeker.id,
        receiverId: lister1.id,
        listingId: listings[0].id,
        content: "Hi, is this room still available?",
      },
      {
        conversationId: conversation.id,
        senderId: lister1.id,
        receiverId: seeker.id,
        listingId: listings[0].id,
        content: "Yes, it is! Would you like to schedule a visit?",
      },
    ],
  });

  await prisma.savedListing.create({
    data: {
      userId: seeker.id,
      listingId: listings[1].id,
    },
  });

  console.log("Seed completed!");
  console.log("Demo accounts:");
  console.log("  Seeker: seeker@demo.com / demo123");
  console.log("  Lister: lister@demo.com / demo123");
  console.log("  Admin:  admin@demo.com / demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
