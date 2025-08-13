// Mock data and functions for Networq Revolutionary Landing Page

// Simulated waitlist storage
let waitlistEmails = [];
let totalRevolutionaries = 1000; // Starting count

// Mock waitlist signup function with revolutionary messaging
export const mockWaitlistSignup = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate API call with revolutionary processing
      if (email && email.includes("@")) {
        if (!waitlistEmails.includes(email)) {
          waitlistEmails.push(email);
          totalRevolutionaries += 1;
          console.log(`🚀 Revolutionary added: ${email}`);
          console.log(`📊 Total Networq revolutionaries: ${totalRevolutionaries}`);
          resolve({ 
            success: true, 
            email, 
            position: waitlistEmails.length,
            totalRevolutionaries: totalRevolutionaries,
            message: "Welcome to the Networq Revolution!" 
          });
        } else {
          resolve({ 
            success: true, 
            email, 
            position: waitlistEmails.indexOf(email) + 1,
            totalRevolutionaries: totalRevolutionaries,
            message: "Already part of the revolution!" 
          });
        }
      } else {
        reject(new Error("Invalid email address"));
      }
    }, 1200); // Simulate network delay with revolutionary processing
  });
};

// Get current revolutionary stats (for admin/demo purposes)
export const getRevolutionaryStats = () => {
  return {
    totalRevolutionaries: totalRevolutionaries,
    newSignups: waitlistEmails.length,
    emails: waitlistEmails,
    conversionRate: "100%", // Mock high conversion
    avgWaitTime: "3 seconds" // Revolutionary speed
  };
};

// Mock revolutionary testimonials
export const mockRevolutionaryTestimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Tech Revolution Leader",
    company: "InnovateNow",
    text: "This is the networking revolution we've all been waiting for. Absolutely game-changing technology!",
    rating: 5,
    revolutionaryScore: 10
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    title: "Startup Revolutionary", 
    company: "DisruptLabs",
    text: "The AI-powered CRM is beyond revolutionary. I can't imagine networking without Networq now.",
    rating: 5,
    revolutionaryScore: 10
  },
  {
    id: 3,
    name: "Jennifer Kim",
    title: "Network Transformer",
    company: "ConnectFuture",
    text: "QR code sharing is impossibly smooth. Everyone at conferences asks about my 'revolutionary networking tool'.",
    rating: 5,
    revolutionaryScore: 10
  },
  {
    id: 4,
    name: "David Wilson",
    title: "Digital Pioneer",
    company: "NextGen Ventures",
    text: "This isn't just an app, it's a complete transformation of how professionals connect. Revolutionary!",
    rating: 5,
    revolutionaryScore: 10
  }
];

// Mock revolutionary features with enhanced descriptions
export const mockRevolutionaryFeatures = [
  {
    id: 1,
    icon: "QrCode",
    title: "QR Code Magic",
    description: "Instant contact exchange that works offline and online. Revolutionary simplicity meets cutting-edge technology.",
    revolutionaryLevel: "Game-Changing"
  },
  {
    id: 2,
    icon: "Users", 
    title: "AI-Powered CRM",
    description: "Every connection becomes an intelligent relationship. Tag, sort, and follow up with revolutionary AI assistance.",
    revolutionaryLevel: "Mind-Blowing"
  },
  {
    id: 3,
    icon: "Zap",
    title: "Dynamic Sync", 
    description: "Contacts update automatically when info changes. Always current, always connected, always revolutionary.",
    revolutionaryLevel: "World-First"
  },
  {
    id: 4,
    icon: "MessageCircle",
    title: "Revolutionary Messaging",
    description: "Connect, chat, and collaborate without friction. Group conversations with revolutionary intelligence.",
    revolutionaryLevel: "Breakthrough"
  },
  {
    id: 5,
    icon: "Calendar",
    title: "Event Discovery",
    description: "Find and create networking events with revolutionary insights. See who's attending before you arrive.",
    revolutionaryLevel: "Industry-First"
  },
  {
    id: 6,
    icon: "MapPin",
    title: "Network Intelligence",
    description: "Discover professionals strategically with revolutionary AI matching. Expand your network with purpose.",
    revolutionaryLevel: "Future-Forward"
  }
];

// Mock revolutionary stats for social proof
export const mockRevolutionaryStats = {
  earlyRevolutionaries: "1,000+",
  connectionSuccessRate: "100%",
  averageExchangeTime: "3 Sec",
  networkingRevolution: "Ongoing",
  professionalTransformation: "Complete"
};

// Mock revolutionary company metrics
export const mockCompanyRevolutionMetrics = {
  foundedBy: "Orlando Taylor, Networking Visionary",
  missionStatus: "Revolutionizing Global Networking",
  revolutionProgress: "95%",
  industryDisruption: "Maximum",
  futureReadiness: "Next-Level"
};

// Mock revolutionary early access perks
export const mockEarlyAccessPerks = [
  "3 months premium features free",
  "Exclusive revolutionary networking events", 
  "Priority AI-powered matching",
  "Beta access to breakthrough features",
  "Direct line to the revolutionary team",
  "Founding member recognition badge"
];

export default {
  mockWaitlistSignup,
  getRevolutionaryStats,
  mockRevolutionaryTestimonials,
  mockRevolutionaryFeatures,
  mockRevolutionaryStats,
  mockCompanyRevolutionMetrics,
  mockEarlyAccessPerks
};