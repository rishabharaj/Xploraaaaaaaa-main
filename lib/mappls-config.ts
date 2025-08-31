// Mappls Configuration for Gamified Map Experience
export interface MapplsConfig {
  restApiKey: string;
  mapApiKey: string;
  clientId?: string;
  clientSecret?: string;
  region?: string;
}

export const mapplsConfig: MapplsConfig = {
  restApiKey: process.env.NEXT_PUBLIC_MAPPLS_REST_API_KEY || "your-rest-api-key-here",
  mapApiKey: process.env.NEXT_PUBLIC_MAPPLS_MAP_API_KEY || "your-map-api-key-here",
  clientId: process.env.NEXT_PUBLIC_MAPPLS_CLIENT_ID || "",
  clientSecret: process.env.NEXT_PUBLIC_MAPPLS_CLIENT_SECRET || "",
  region: "IND"
};

// Indore specific coordinates and bounds
export const indoreConfig = {
  center: [75.8577, 22.7196], // Indore coordinates [lng, lat]
  zoom: 12,
  bounds: [
    [75.7, 22.6], // Southwest coordinates
    [76.0, 22.8]  // Northeast coordinates
  ]
};

// Game locations for Indore cafes and points of interest
export const gameLocations = [
  {
    id: "cafe-1",
    name: "Coffee Culture",
    coordinates: [75.8648, 22.7203],
    type: "cafe",
    rewards: {
      coupon: "10% OFF on Coffee",
      points: 100,
      badge: "Coffee Explorer"
    },
    visited: false
  },
  {
    id: "cafe-2", 
    name: "Cafe Terazzo",
    coordinates: [75.8577, 22.7231],
    type: "cafe",
    rewards: {
      coupon: "20% OFF on Meals",
      points: 150,
      badge: "Food Critic"
    },
    visited: false
  },
  {
    id: "cafe-3",
    name: "Barista Coffee",
    coordinates: [75.8701, 22.7167],
    type: "cafe",
    rewards: {
      coupon: "Buy 1 Get 1 Free",
      points: 200,
      badge: "Barista Buddy"
    },
    visited: false
  },
  {
    id: "landmark-1",
    name: "Rajwada Palace",
    coordinates: [75.8577, 22.7196],
    type: "landmark",
    rewards: {
      coupon: "30% OFF Photography Session",
      points: 250,
      badge: "Heritage Hunter"
    },
    visited: false
  },
  {
    id: "mall-1",
    name: "Phoenix Citadel Mall",
    coordinates: [75.8648, 22.7284],
    type: "shopping",
    rewards: {
      coupon: "15% OFF on Shopping",
      points: 180,
      badge: "Shopping Spree"
    },
    visited: false
  }
];

// Achievement system
export const achievements = {
  firstVisit: {
    name: "First Steps",
    description: "Visit your first location",
    points: 50,
    icon: "👶"
  },
  coffeeExplorer: {
    name: "Coffee Explorer", 
    description: "Visit 3 different cafes",
    points: 300,
    icon: "☕"
  },
  weekendWarrior: {
    name: "Weekend Warrior",
    description: "Visit 5 locations in one weekend",
    points: 500,
    icon: "🏆"
  },
  localLegend: {
    name: "Local Legend",
    description: "Visit all locations in Indore",
    points: 1000,
    icon: "👑"
  }
};

// User level system
export const levelSystem = {
  levels: [
    { level: 1, name: "Explorer", minPoints: 0, maxPoints: 999, color: "#8B5CF6" },
    { level: 2, name: "Adventurer", minPoints: 1000, maxPoints: 2999, color: "#3B82F6" },
    { level: 3, name: "Navigator", minPoints: 3000, maxPoints: 5999, color: "#10B981" },
    { level: 4, name: "Pathfinder", minPoints: 6000, maxPoints: 9999, color: "#F59E0B" },
    { level: 5, name: "Legend", minPoints: 10000, maxPoints: Infinity, color: "#EF4444" }
  ]
};

export const getUserLevel = (points: number) => {
  return levelSystem.levels.find(level => 
    points >= level.minPoints && points <= level.maxPoints
  ) || levelSystem.levels[0];
};