// Mock data and functions for Networq landing page

// Simulated waitlist storage
let waitlistEmails = [];

// Mock waitlist signup function
export const mockWaitlistSignup = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate API call
      if (email && email.includes("@")) {
        if (!waitlistEmails.includes(email)) {
          waitlistEmails.push(email);
          console.log(`✅ Added to waitlist: ${email}`);
          console.log(`📊 Total waitlist members: ${waitlistEmails.length}`);
          resolve({ 
            success: true, 
            email, 
            position: waitlistEmails.length,
            message: "Successfully added to waitlist!" 
          });
        } else {
          resolve({ 
            success: true, 
            email, 
            position: waitlistEmails.indexOf(email) + 1,
            message: "Already on the waitlist!" 
          });
        }
      } else {
        reject(new Error("Invalid email address"));
      }
    }, 1000); // Simulate network delay
  });
};

// Get current waitlist stats (for admin/demo purposes)
export const getWaitlistStats = () => {
  return {
    totalSignups: waitlistEmails.length,
    emails: waitlistEmails
  };
};

// Mock testimonials data
export const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Sales Director",
    company: "TechCorp",
    text: "Finally, a networking solution that actually works. No more lost business cards!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    title: "Startup Founder", 
    company: "InnovateLabs",
    text: "The built-in CRM is a game-changer. I can actually follow up with my connections now.",
    rating: 5
  },
  {
    id: 3,
    name: "Jennifer Kim",
    title: "Marketing Manager",
    company: "GrowthCo",
    text: "QR code sharing is so smooth. Everyone at the conference was impressed.",
    rating: 5
  }
];

// Mock feature highlights
export const mockFeatures = [
  {
    id: 1,
    icon: "QrCode",
    title: "QR Code Magic",
    description: "Instant contact exchange that works offline and online. No more fumbling with business cards."
  },
  {
    id: 2,
    icon: "Users", 
    title: "Built-in CRM",
    description: "Every connection becomes a managed relationship. Tag, sort, and follow up like a pro."
  },
  {
    id: 3,
    icon: "Zap",
    title: "Dynamic Updates", 
    description: "When contacts update their info, your saved details update automatically. No more outdated data."
  },
  {
    id: 4,
    icon: "MessageCircle",
    title: "In-App Messaging",
    description: "Connect, chat, and build relationships without leaving the app. Group chats included."
  },
  {
    id: 5,
    icon: "Calendar",
    title: "Event Discovery",
    description: "Find local networking events, create your own, and see who's attending before you go."
  },
  {
    id: 6,
    icon: "MapPin",
    title: "Discover Network",
    description: "Browse other professionals in your area and industry. Expand your network strategically."
  }
];

// Mock stats for social proof
export const mockStats = {
  earlyAdopters: "1,000+",
  contactSuccessRate: "100%",
  averageExchangeTime: "3 Sec"
};

export default {
  mockWaitlistSignup,
  getWaitlistStats,
  mockTestimonials,
  mockFeatures,
  mockStats
};