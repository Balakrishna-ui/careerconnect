const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingMentors() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "MENTOR",
        mentorProfile: null
      }
    });

    console.log(`Found ${users.length} users with MENTOR role but no Mentor profile.`);

    for (const user of users) {
      await prisma.mentor.create({
        data: {
          userId: user.id,
          name: user.name || "Mentor",
          applicationStatus: "DRAFT",
          profileCompleted: false
        }
      });
      console.log(`Created Mentor profile for user: ${user.email}`);
    }

    // Also check if they are logged in with any other email and trying to access /mentor
    // If the user hasn't completed signup, maybe they are just JOB_SEEKER? 
    // Wait, the layout requires role === "MENTOR", otherwise it redirects to /signup?view=login
    // So the user MUST be a MENTOR.

    console.log("Done.");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingMentors();
