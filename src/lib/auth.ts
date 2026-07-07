import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: "JOB_SEEKER", // Default role
                premium: false,
              };
            },
          }),
        ]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
              return {
                id: profile.id.toString(),
                name: profile.name || profile.login,
                email: profile.email,
                image: profile.avatar_url,
                role: "JOB_SEEKER", // Default role
                premium: false,
              };
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { mentorProfile: true },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        const expectedRole = credentials.role;
        if (expectedRole && user.role !== expectedRole) {
          const switchMsg = user.role === 'MENTOR' ? 'Mentor' : 'Job Seeker';
          throw new Error(`This account is registered as a ${switchMsg}. Please switch to the ${switchMsg} login.`);
        }

        // Mentor status check
        if (user.mentorProfile) {
          if (user.mentorProfile.applicationStatus === "PENDING") {
            throw new Error("Your mentor application is currently under review. You will receive an email once it has been approved.");
          }
          if (user.mentorProfile.applicationStatus === "REJECTED") {
            throw new Error("Your mentor application was not approved. Please review the feedback or submit a new application.");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          premium: user.premium,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { mentorProfile: true },
          });

          if (dbUser) {
            // Check if user was just created (within the last 10 seconds)
            const isNewUser = Date.now() - dbUser.createdAt.getTime() < 10000;

            if (isNewUser) {
              const cookieStore = await cookies();
              const oauthRoleCookie = cookieStore.get("oauth_role")?.value;
              const desiredRole = oauthRoleCookie === "mentor" ? "MENTOR" : "JOB_SEEKER";

              await prisma.user.update({
                where: { id: user.id },
                data: { role: desiredRole },
              });
              user.role = desiredRole;

              if (desiredRole === "MENTOR" && !dbUser.mentorProfile) {
                await prisma.mentor.create({
                  data: {
                    userId: user.id,
                    name: user.name || "Mentor",
                    applicationStatus: "DRAFT",
                    companyTier: "Other",
                  },
                });
              }
            } else {
              // Existing user check for Role Mismatch
              const cookieStore = await cookies();
              const oauthRoleCookie = cookieStore.get("oauth_role")?.value;
              const expectedRole = oauthRoleCookie === "mentor" ? "MENTOR" : "JOB_SEEKER";
              
              if (dbUser.role !== expectedRole) {
                const switchMsg = dbUser.role === 'MENTOR' ? 'Mentor' : 'Job Seeker';
                const encodedMsg = encodeURIComponent(`This account is registered as a ${switchMsg}. Please switch to the ${switchMsg} login.`);
                return `/signup?view=login&type=${oauthRoleCookie}&error_msg=${encodedMsg}`;
              }

              // Existing user check for Mentor status
              if (dbUser.mentorProfile) {
                if (dbUser.mentorProfile.applicationStatus === "PENDING") {
                  throw new Error("Your mentor application is currently under review.");
                }
                if (dbUser.mentorProfile.applicationStatus === "REJECTED") {
                  throw new Error("Your mentor application was not approved.");
                }
              }
            }
          }
        } catch (error: any) {
          if (error.message.includes("review") || error.message.includes("approved")) {
            throw error; // Let NextAuth catch this and redirect with error
          }
          console.error("Error in OAuth signIn callback:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.premium = user.premium;
      }
      
      // Handle manual session updates (e.g. after payment)
      if (trigger === "update" && session) {
        token.premium = session.premium ?? token.premium;
        token.role = session.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.premium = token.premium as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signup",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (error) {
          console.error("Failed to update lastLoginAt", error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development",
};
