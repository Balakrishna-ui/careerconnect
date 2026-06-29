import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMPANIES = [
  { name: "Google", tier: "FAANG" },
  { name: "Amazon", tier: "FAANG" },
  { name: "Meta", tier: "FAANG" },
  { name: "Apple", tier: "FAANG" },
  { name: "Netflix", tier: "FAANG" },
  { name: "Microsoft", tier: "Big Tech" },
  { name: "Adobe", tier: "Big Tech" },
  { name: "Salesforce", tier: "Big Tech" },
  { name: "Stripe", tier: "Unicorn Startups" },
  { name: "Airbnb", tier: "Unicorn Startups" },
  { name: "Razorpay", tier: "Unicorn Startups" },
  { name: "Swiggy", tier: "Unicorn Startups" },
  { name: "Zomato", tier: "Unicorn Startups" },
  { name: "Flipkart", tier: "Unicorn Startups" },
  { name: "Deloitte", tier: "Consulting" },
  { name: "EY", tier: "Consulting" },
  { name: "PwC", tier: "Consulting" },
  { name: "KPMG", tier: "Consulting" },
  { name: "Infosys", tier: "IT Services" },
  { name: "TCS", tier: "IT Services" },
  { name: "Wipro", tier: "IT Services" },
  { name: "Accenture", tier: "IT Services" },
];

const ROLES = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
  "Engineering Manager", "Product Manager", "Senior Product Manager",
  "Data Scientist", "Data Analyst", "ML Engineer",
  "UX Designer", "UI Designer", "Product Designer",
  "DevOps Engineer", "Cloud Architect", "Security Engineer",
  "SAP Consultant", "Business Analyst", "Marketing Manager",
  "Frontend Architect", "Backend Engineer", "Full Stack Developer",
];

const ALL_SKILLS = [
  "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS",
  "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Spring Boot", "Django",
  "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "Linux",
  "Machine Learning", "Data Science", "Deep Learning", "NLP", "SQL", "MongoDB", "PostgreSQL", "Redis", "ElasticSearch", "Data Engineering", "Apache Spark",
  "Figma", "User Research", "Product Strategy", "Product Analytics", "Agile", "Scrum",
  "SAP FICO", "SAP SD", "SAP MM", "Power BI", "Tableau", "Salesforce",
  "System Design", "Microservices", "REST APIs", "GraphQL", "Cyber Security", "Blockchain",
  "Leadership", "Negotiation", "Career Growth", "Mock Interview", "Resume Review"
];

const GOALS = [
  "Resume Review", "Mock Interview", "Career Switch", "Promotion Guidance",
  "Salary Negotiation", "Leadership Coaching", "MBA Guidance", "Study Abroad",
  "Portfolio Review", "Technical Interview", "System Design Interview",
];

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Marathi", "Bengali", "Gujarati"];
const INDUSTRIES = ["IT Services", "Product Based", "Consulting", "Banking", "Healthcare", "FinTech", "E-Commerce", "EdTech"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi", "Gurgaon", "Noida", "Remote"];

const NAMES = [
  "Aarav Sharma", "Priya Nair", "Rohan Mehta", "Ananya Singh", "Vikram Patel",
  "Kavya Reddy", "Arjun Kumar", "Divya Joshi", "Siddharth Iyer", "Pooja Agarwal",
  "Nikhil Gupta", "Swati Bhat", "Rahul Verma", "Sneha Pillai", "Aditya Rao",
  "Manisha Kapoor", "Kiran Nambiar", "Deepak Sinha", "Riya Bhatt", "Amit Desai",
  "Sarah Chen", "Marcus Johnson", "Elena Rodriguez", "David Kim", "Anita Patel",
  "James Wilson", "Prithvi Chakraborty", "Meera Krishnamurthy", "Suresh Natarajan",
  "Lakshmi Venkataraman", "Abhishek Mishra", "Tanvi Gokhale", "Harsh Vardhan",
  "Nandita Bose", "Rajesh Pillai", "Shweta Kulkarni", "Gaurav Tiwari",
  "Archana Dubey", "Saurabh Jain", "Preeti Malhotra", "Vivek Anand",
  "Sunita Rao", "Mohit Saxena", "Rekha Menon", "Ashish Bhatia",
  "Payal Choudhary", "Deepika Sharma", "Sandeep Nair", "Neha Srivastava",
  "Tarun Bajaj", "Lavanya Gopalan", "Ajay Pandey", "Shruti Bhattacharya",
  "Varun Malviya", "Geeta Bansal", "Rajan Chandran", "Smita Wagle",
  "Pritam Das", "Ankita Raut", "Devesh Trivedi", "Swapna Patil",
  "Naresh Subramanian", "Bhavna Aggarwal", "Srikant Murali", "Pallavi Deshpande",
  "Chirag Shah", "Harsha Iyengar", "Yamini Krishnan", "Shailesh Garg",
  "Nalini Menon", "Tushar Khandagale", "Vidya Balan", "Arun Nambiar",
  "Kavitha Seshadri", "Dinesh Sundaram", "Ritu Saxena", "Vineet Agarwal",
  "Mythili Suresh", "Pravin Salunkhe", "Jyoti Agnihotri", "Raghav Mukherjee",
  "Sudha Venkatesan", "Karthik Srinivasan", "Bhavna Sharma", "Alok Tiwary",
  "Ramesh Babu", "Vasudha Gopal", "Dhananjay Kulkarni", "Suparna Ghosh",
  "Vishal Thakkar", "Seema Datta", "Girish Bhatt", "Hema Sharma",
  "Pranav Kamat", "Nisha Malhotra", "Ashwin Ramakrishnan", "Poonam Joshi",
  "Sanjeev Nair", "Taruna Chawla", "Indrajit Roy", "Savita Patel",
  "Mahesh Babu", "Revathi Sundaram",
];

const IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&auto=format&fit=crop",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getNextAvailable(): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 7));
  return d;
}

async function main() {
  console.log("🌱 Clearing database...");
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.mentorSettings.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding a test user...");
  const testUser = await prisma.user.create({
    data: {
      name: "Alex Jobseeker",
      email: "alex@example.com",
      image: "https://ui-avatars.com/api/?name=Alex+Jobseeker&background=0D8ABC&color=fff"
    }
  });

  console.log("🌱 Seeding mentors and their availability...");
  
  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const company = COMPANIES[i % COMPANIES.length];
    const expYears = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16][i % 13];
    const skillsList = pickMultiple(ALL_SKILLS, 3, 7);
    const langs = pickMultiple(LANGUAGES, 1, 3);
    const firstName = name.split(" ")[0].toLowerCase();
    
    // Create User first
    const user = await prisma.user.create({
      data: {
        name: name,
        email: `${firstName}${i}@example.com`,
        role: "MENTOR",
        image: IMAGES[i % IMAGES.length]
      }
    });

    const mentor = await prisma.mentor.create({ 
      data: {
        userId: user.id,
        name: name,
        role: ROLES[i % ROLES.length],
        company: company.name,
        companyTier: company.tier,
        industry: INDUSTRIES[i % INDUSTRIES.length],
        experienceYears: expYears,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewsCount: Math.floor(Math.random() * 300) + 5,
        price: (Math.floor(Math.random() * 40) + 5) * 100,
        image: IMAGES[i % IMAGES.length],
        location: pick(LOCATIONS),
        languages: langs.join(", "),
        remoteAvailable: Math.random() > 0.3,
        nextAvailable: getNextAvailable(),
        totalSessions: Math.floor(Math.random() * 500) + 5,
        profileCompleted: true,
        completionScore: 100,
        applicationStatus: "VERIFIED",
        skills: {
          create: skillsList.map(s => ({ name: s, category: "Technical" }))
        }
      } 
    });

    // Create default settings
    await prisma.mentorSettings.create({
      data: {
        mentorId: mentor.id,
        sessionDuration: 60,
        bufferTime: 15,
        maxSessionsPerDay: 4,
        advanceBookingWindow: 30,
        noticePeriod: 24,
      }
    });

    // Create weekly schedule: Mon-Fri 09:00 to 17:00
    const schedules = [];
    for (let day = 1; day <= 5; day++) {
      schedules.push({
        mentorId: mentor.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      });
    }
    await prisma.weeklySchedule.createMany({ data: schedules });
  }

  console.log(`✅ Seeded ${NAMES.length} mentors with schedules successfully!`);
  console.log(`✅ Test User ID: ${testUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
