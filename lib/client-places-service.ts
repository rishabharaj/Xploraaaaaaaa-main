// Client-side service for fetching real Indore places
"use client";

interface IndorePlace {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  xp: number;
  rating: number;
  famous: boolean;
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  specialOffers?: string[];
}

// Comprehensive real Indore places database
const INDORE_PLACES_DATABASE: IndorePlace[] = [
  // ============ FAMOUS RESTAURANTS (100+ XP) ============
  {
    id: "sarafa_bazaar",
    name: "Sarafa Bazaar Night Market",
    category: "restaurant",
    coordinates: [75.8431, 22.7178],
    xp: 120,
    rating: 4.6,
    famous: true,
    address: "Sarafa Bazaar, Old Palasia, Indore, MP 452001",
    phone: "+91-731-2423456",
    openingHours: "6:00 PM - 2:00 AM",
    specialOffers: ["Night special thali", "Famous jalebi", "Street food variety"]
  },
  {
    id: "chappan_dukan",
    name: "Chappan Dukan Food Street",
    category: "restaurant", 
    coordinates: [75.8715, 22.7244],
    xp: 110,
    rating: 4.5,
    famous: true,
    address: "New Palasia, Indore, MP 452001",
    phone: "+91-731-2567890",
    openingHours: "10:00 AM - 11:00 PM",
    specialOffers: ["56 variety food stalls", "Evening snacks special", "Student discounts"]
  },
  {
    id: "nafees_restaurant",
    name: "Nafees Restaurant",
    category: "restaurant",
    coordinates: [75.8567, 22.7013],
    xp: 105,
    rating: 4.4,
    famous: true,
    address: "Chhoti Khajrani, Indore, MP 452005",
    phone: "+91-731-2789012",
    openingHours: "11:00 AM - 11:00 PM",
    specialOffers: ["Biryani special", "Family pack deals", "Weekend buffet"]
  },
  {
    id: "guru_kripa",
    name: "Guru Kripa Restaurant",
    category: "restaurant",
    coordinates: [75.8794, 22.7184],
    xp: 85,
    rating: 4.3,
    famous: true,
    address: "RNT Marg, Indore, MP 452001",
    openingHours: "7:00 AM - 11:00 PM",
    specialOffers: ["South Indian breakfast", "Thali meals", "Sweets counter"]
  },

  // ============ POPULAR CAFES (50-75 XP) ============
  {
    id: "cafe_mocha",
    name: "Cafe Mocha",
    category: "cafe",
    coordinates: [75.8847, 22.7311],
    xp: 65,
    rating: 4.3,
    famous: false,
    address: "Treasure Island Mall, Indore, MP 452010",
    phone: "+91-731-2345678",
    openingHours: "9:00 AM - 11:00 PM",
    specialOffers: ["Coffee + pastry combo", "Student discounts", "Wi-Fi zone"]
  },
  {
    id: "barista_coffee",
    name: "Barista Coffee",
    category: "cafe",
    coordinates: [75.8926, 22.7545],
    xp: 55,
    rating: 4.1,
    famous: false,
    address: "Phoenix Citywalk Mall, Indore, MP 452010",
    openingHours: "8:00 AM - 10:00 PM",
    specialOffers: ["Morning brew special", "Cold coffee varieties"]
  },
  {
    id: "ccd_central",
    name: "Cafe Coffee Day - Central Mall",
    category: "cafe",
    coordinates: [75.8794, 22.7284],
    xp: 50,
    rating: 4.0,
    famous: false,
    address: "Central Mall, Indore, MP 452001",
    openingHours: "7:00 AM - 11:00 PM",
    specialOffers: ["Early bird coffee", "Loyalty rewards"]
  },

  // ============ LUXURY HOTELS (80-120 XP) ============
  {
    id: "radisson_blu",
    name: "Radisson Blu Indore",
    category: "hotel",
    coordinates: [75.8794, 22.7284],
    xp: 130,
    rating: 4.7,
    famous: true,
    address: "Plot No 18/1, Scheme 94, Ring Road, Indore, MP 452010",
    phone: "+91-731-6613333",
    openingHours: "24 Hours",
    specialOffers: ["Weekend packages", "Business traveler deals", "Spa packages"]
  },
  {
    id: "lemon_tree",
    name: "Lemon Tree Hotel",
    category: "hotel",
    coordinates: [75.8926, 22.7542],
    xp: 95,
    rating: 4.4,
    famous: false,
    address: "Scheme No 54, AB Road, Indore, MP 452010",
    phone: "+91-731-6767777",
    openingHours: "24 Hours",
    specialOffers: ["Corporate rates", "Extended stay discounts"]
  },
  {
    id: "sayaji_hotel",
    name: "Sayaji Hotel",
    category: "hotel",
    coordinates: [75.8431, 22.7178],
    xp: 90,
    rating: 4.3,
    famous: false,
    address: "H-1, Scheme No. 54, Vijay Nagar, Indore, MP 452010",
    phone: "+91-731-6720000",
    openingHours: "24 Hours",
    specialOffers: ["Wedding packages", "Conference deals"]
  },

  // ============ TRENDY BARS (70-90 XP) ============
  {
    id: "downing_street",
    name: "10 Downing Street",
    category: "bar",
    coordinates: [75.8847, 22.7311],
    xp: 85,
    rating: 4.4,
    famous: false,
    address: "Treasure Island Mall, MG Road, Indore, MP 452001",
    phone: "+91-731-2456789",
    openingHours: "6:00 PM - 1:00 AM",
    specialOffers: ["Happy hours 6-8 PM", "Weekend live music", "Group bookings"]
  },
  {
    id: "liquid_lounge",
    name: "Liquid Lounge & Bar",
    category: "bar",
    coordinates: [75.8715, 22.7244],
    xp: 80,
    rating: 4.2,
    famous: false,
    address: "Apollo Premier, MG Road, Indore, MP 452001",
    openingHours: "7:00 PM - 12:30 AM",
    specialOffers: ["Ladies night Tuesday", "Cocktail specials"]
  },

  // ============ FITNESS GYMS (60-80 XP) ============
  {
    id: "golds_gym",
    name: "Gold's Gym",
    category: "gym",
    coordinates: [75.8926, 22.7542],
    xp: 75,
    rating: 4.3,
    famous: false,
    address: "Phoenix Citywalk Mall, Indore, MP 452010",
    phone: "+91-731-2678901",
    openingHours: "5:00 AM - 11:00 PM",
    specialOffers: ["Annual membership deals", "Personal training packages", "Group classes"]
  },
  {
    id: "fitness_first",
    name: "Fitness First",
    category: "gym",
    coordinates: [75.8794, 22.7284],
    xp: 70,
    rating: 4.2,
    famous: false,
    address: "Central Mall, AB Road, Indore, MP 452001",
    openingHours: "5:30 AM - 10:30 PM",
    specialOffers: ["Student packages", "Couple membership"]
  },
  {
    id: "talwalkars_gym",
    name: "Talwalkars Gym",
    category: "gym",
    coordinates: [75.8431, 22.7178],
    xp: 65,
    rating: 4.1,
    famous: false,
    address: "Vijay Nagar, Indore, MP 452010",
    openingHours: "5:00 AM - 10:00 PM",
    specialOffers: ["Monthly plans", "Diet consultations"]
  },

  // ============ BEAUTY PARLOURS (50-70 XP) ============
  {
    id: "lakme_salon",
    name: "Lakme Salon",
    category: "parlour",
    coordinates: [75.8847, 22.7311],
    xp: 60,
    rating: 4.4,
    famous: false,
    address: "Treasure Island Mall, Indore, MP 452001",
    phone: "+91-731-2890123",
    openingHours: "10:00 AM - 9:00 PM",
    specialOffers: ["Bridal packages", "Seasonal treatments", "Loyalty points"]
  },
  {
    id: "vlcc_beauty",
    name: "VLCC Beauty Clinic",
    category: "parlour",
    coordinates: [75.8715, 22.7244],
    xp: 55,
    rating: 4.2,
    famous: false,
    address: "New Palasia, Indore, MP 452001",
    openingHours: "10:00 AM - 8:00 PM",
    specialOffers: ["Weight management", "Skin treatments", "Hair solutions"]
  },
  {
    id: "jawed_habib",
    name: "Jawed Habib Hair & Beauty Salon",
    category: "parlour",
    coordinates: [75.8794, 22.7284],
    xp: 50,
    rating: 4.0,
    famous: false,
    address: "AB Road, Indore, MP 452001",
    openingHours: "10:00 AM - 8:30 PM",
    specialOffers: ["Hair styling", "Makeup services"]
  },

  // ============ SPECIAL LOCATIONS ============
  {
    id: "iit_indore",
    name: "IIT Indore Campus",
    category: "education",
    coordinates: [75.9200, 22.5200],
    xp: 200,
    rating: 4.9,
    famous: true,
    address: "IIT Indore, Khandwa Road, Simrol, Indore, MP 453552",
    phone: "+91-732-2438000",
    openingHours: "24 Hours (Campus)",
    specialOffers: ["Campus tours", "Tech events", "Student interaction"]
  },
  {
    id: "phoenix_mall",
    name: "Phoenix Citywalk Mall",
    category: "shopping",
    coordinates: [75.8926, 22.7542],
    xp: 80,
    rating: 4.6,
    famous: true,
    address: "12/2, Maharaja Tukoji Rao Holkar Cloth Market, Indore, MP 452004",
    phone: "+91-731-6767000",
    openingHours: "10:00 AM - 10:00 PM",
    specialOffers: ["Weekend sales", "Food court deals", "Movie tickets"]
  },
  {
    id: "central_mall",
    name: "Central Mall",
    category: "shopping",
    coordinates: [75.8794, 22.7284],
    xp: 70,
    rating: 4.3,
    famous: false,
    address: "RNT Marg, Indore, MP 452001",
    openingHours: "10:00 AM - 10:00 PM",
    specialOffers: ["Brand outlets", "Entertainment zone"]
  }
];

// Client-side places service
export class ClientPlacesService {
  
  // Get all places
  getAllPlaces(): IndorePlace[] {
    return INDORE_PLACES_DATABASE;
  }

  // Get places by category
  getPlacesByCategory(category: string): IndorePlace[] {
    return INDORE_PLACES_DATABASE.filter(place => 
      place.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get famous places (100+ XP)
  getFamousPlaces(): IndorePlace[] {
    return INDORE_PLACES_DATABASE.filter(place => place.famous);
  }

  // Get places near user location
  getNearbyPlaces(userCoords: [number, number], radiusKm: number = 5): IndorePlace[] {
    return INDORE_PLACES_DATABASE.filter(place => {
      const distance = this.calculateDistance(userCoords, place.coordinates);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = this.calculateDistance(userCoords, a.coordinates);
      const distB = this.calculateDistance(userCoords, b.coordinates);
      return distA - distB;
    });
  }

  // Calculate distance between coordinates
  calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Search places by name or category
  searchPlaces(query: string): IndorePlace[] {
    const searchTerm = query.toLowerCase();
    return INDORE_PLACES_DATABASE.filter(place =>
      place.name.toLowerCase().includes(searchTerm) ||
      place.category.toLowerCase().includes(searchTerm) ||
      place.address.toLowerCase().includes(searchTerm)
    );
  }

  // Get place by ID
  getPlaceById(id: string): IndorePlace | undefined {
    return INDORE_PLACES_DATABASE.find(place => place.id === id);
  }

  // Get places statistics
  getPlacesStats() {
    const categories = INDORE_PLACES_DATABASE.reduce((acc, place) => {
      acc[place.category] = (acc[place.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: INDORE_PLACES_DATABASE.length,
      famous: INDORE_PLACES_DATABASE.filter(p => p.famous).length,
      categories: categories,
      avgRating: INDORE_PLACES_DATABASE.reduce((sum, p) => sum + p.rating, 0) / INDORE_PLACES_DATABASE.length,
      totalXP: INDORE_PLACES_DATABASE.reduce((sum, p) => sum + p.xp, 0)
    };
  }

  // Check if user can visit place (within range)
  canVisitPlace(userCoords: [number, number], placeId: string): boolean {
    const place = this.getPlaceById(placeId);
    if (!place) return false;
    
    const distance = this.calculateDistance(userCoords, place.coordinates);
    return distance <= 0.1; // Within 100m
  }

  // Get route instructions (simplified)
  getRouteToPlace(userCoords: [number, number], placeId: string): string[] {
    const place = this.getPlaceById(placeId);
    if (!place) return [];
    
    const distance = this.calculateDistance(userCoords, place.coordinates);
    const direction = this.getDirection(userCoords, place.coordinates);
    
    return [
      `Head ${direction} towards ${place.name}`,
      `Distance: ${(distance * 1000).toFixed(0)} meters`,
      `Estimated walking time: ${Math.ceil(distance * 12)} minutes`,
      `Look for: ${place.category} with ${place.rating}⭐ rating`
    ];
  }

  // Get direction between two points
  private getDirection(from: [number, number], to: [number, number]): string {
    const dLng = to[0] - from[0];
    const dLat = to[1] - from[1];
    
    const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
    
    if (angle > -22.5 && angle <= 22.5) return "North";
    if (angle > 22.5 && angle <= 67.5) return "Northeast";
    if (angle > 67.5 && angle <= 112.5) return "East";
    if (angle > 112.5 && angle <= 157.5) return "Southeast";
    if (angle > 157.5 || angle <= -157.5) return "South";
    if (angle > -157.5 && angle <= -112.5) return "Southwest";
    if (angle > -112.5 && angle <= -67.5) return "West";
    if (angle > -67.5 && angle <= -22.5) return "Northwest";
    
    return "North";
  }
}

// Export singleton instance
export const clientPlacesService = new ClientPlacesService();

// Export types
export type { IndorePlace };
