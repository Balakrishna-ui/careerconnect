import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, lastName, email, password, role, education, experience, bio, image,
      gender, dob, country, linkedin, designation, company, industry, skills, sessions, schedule
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // Hash password (using 10 rounds instead of 12 for 4x faster performance)
    const passwordHash = await bcrypt.hash(password, 10);

    // Combine names
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const finalRole = role === "MENTOR" ? "MENTOR" : "JOB_SEEKER";

    // Calculate Completion Score for Mentors
    let completionScore = 0;
    if (finalRole === "MENTOR") {
      if (firstName && lastName && email) completionScore += 10;
      if (gender && dob && country) completionScore += 10;
      if (designation && company && industry) completionScore += 15;
      if (skills && skills.length >= 3) completionScore += 15;
      if (bio && bio.length >= 300) completionScore += 10;
      if (sessions && sessions.length >= 1) completionScore += 15;
      if (schedule && schedule.some((s: any) => s.isAvailable)) completionScore += 10;
      if (linkedin) completionScore += 5;
    }
    const profileCompleted = completionScore >= 80;

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: passwordHash,
        role: finalRole,
        ...(image ? { image } : {}),
        ...(bio ? { bio } : {}),
        ...(finalRole === "MENTOR" ? {
          mentorProfile: {
            create: {
              name: fullName,
              applicationStatus: "PENDING",
              completionScore,
              profileCompleted,
              ...(image ? { image } : {}),
              ...(bio ? { bio } : {}),
              ...(gender ? { gender } : {}),
              ...(dob ? { dob: new Date(dob) } : {}),
              ...(country ? { country } : {}),
              ...(designation ? { role: designation } : {}),
              ...(company ? { company } : {}),
              ...(industry ? { industry } : {}),
              educations: {
                create: education?.filter((edu: any) => edu.highestQualification).map((edu: any) => ({
                  degree: edu.highestQualification,
                  branch: edu.specialization || null,
                  college: edu.college,
                  passingYear: edu.passingYear,
                  cgpa: edu.score || null,
                })) || []
              },
              experiences: {
                create: experience?.filter((exp: any) => exp.company && exp.jobTitle).map((exp: any) => ({
                  companyName: exp.company,
                  designation: exp.jobTitle,
                  duration: exp.isCurrent ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`,
                  responsibilities: exp.description || null,
                })) || []
              },
              skills: {
                create: skills?.map((skillName: string) => ({
                  name: skillName,
                  category: "Technical" // Defaulting to Technical, exact mapping doesn't matter much here
                })) || []
              },
              sessionTypes: {
                create: sessions?.map((session: any) => ({
                  title: session.type,
                  duration: session.duration,
                  price: parseInt(session.price) || 0
                })) || []
              },
              weeklySchedules: {
                create: schedule?.map((day: any) => ({
                  dayOfWeek: day.dayOfWeek,
                  startTime: day.startTime,
                  endTime: day.endTime,
                  isAvailable: day.isAvailable
                })) || []
              },
              ...(linkedin ? {
                socialProfiles: {
                  create: {
                    linkedin
                  }
                }
              } : {})
            }
          }
        } : {}),
      },
      include: {
        mentorProfile: true
      }
    });

    if (finalRole === "MENTOR") {
      // Don't await pusher to prevent blocking the registration response if Pusher is slow or down
      pusherServer.trigger("admin-channel", "mentor-registered", {
        mentorId: newUser.mentorProfile?.id,
        name: fullName,
        email: email
      }).catch(pusherError => {
        console.error("Pusher error (mentor-registered):", pusherError);
      });
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
