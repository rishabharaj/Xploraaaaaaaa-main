// Real-time places service for Indore area
// Fetches live data for cafes, restaurants, gyms, bars, hotels, parlours

export interface RealPlace {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'gym' | 'bar' | 'hotel' | 'parlour';
  coordinates: [number, number]; // [lng, lat]
  address: string;
  rating: number;
  totalRatings: number;
  priceLevel: 1 | 2 | 3 | 4; // 1 = cheap, 4 = expensive
  isOpen?: boolean;
  phone?: string;
  website?: string;
  photos?: string[];
  distance?: number; // from user location
  xpPoints: number; // Based on fame/popularity
  famousLevel: 'normal' | 'popular' | 'famous' | 'legendary';
  specialRewards?: {
    type: 'discount' | 'freebie' | 'points_multiplier';
    value: string;
  }[];
}

export interface IndoreArea {
  center: [number, number];
  radius: number; // in km
  name: string;
}

// Indore areas from city to IIT
export const indoreAreas: IndoreArea[] = [
  { center: [75.8577, 22.7196], radius: 3, name: "Central Indore" },
  { center: [75.9200, 22.6800], radius: 2, name: "Vijay Nagar" },
  { center: [75.9300, 22.6500], radius: 2, name: "Bhawarkua" },
  { center: [75.9400, 22.5800], radius: 1.5, name: "IIT Indore Area" },
  { center: [75.8800, 22.7400], radius: 2, name: "Palasia" },
  { center: [75.8600, 22.6900], radius: 2, name: "MG Road" }
];

// Famous places in Indore with preset XP values
const famousIndorePlaces = {
  // Legendary places (100+ XP)
  legendary: [
    "Sarafa Bazaar", "Chappan Dukan", "Rajwada", "Hotel Apna Palace", 
    "Indian Coffee House", "Nafees Restaurant"
  ],
  // Famous places (75-100 XP)
  famous: [
    "Olive Garden", "Sayaji Hotel", "Marriott Indore", "Effotel Hotel",
    "Guru Kripa", "Madhuram Sweets", "Hotel President"
  ],
  // Popular places (50-75 XP)
  popular: [
    "Cafe Coffee Day", "Starbucks", "McDonald's", "KFC", "Pizza Hut",
    "Dominos", "Subway", "Barista Coffee"
  ]
};

class RealPlacesService {
  private placesCache = new Map<string, RealPlace[]>();
  private lastFetch = new Map<string, number>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Calculate XP points based on place fame and rating
  private calculateXPPoints(placeName: string, rating: number, totalRatings: number, type: string): number {
    let baseXP = 20;
    
    // Fame multiplier
    if (famousIndorePlaces.legendary.some(famous => placeName.toLowerCase().includes(famous.toLowerCase()))) {
      baseXP = 100;
    } else if (famousIndorePlaces.famous.some(famous => placeName.toLowerCase().includes(famous.toLowerCase()))) {
      baseXP = 75;
    } else if (famousIndorePlaces.popular.some(popular => placeName.toLowerCase().includes(popular.toLowerCase()))) {
      baseXP = 50;
    }

    // Rating bonus
    const ratingBonus = Math.round((rating - 3) * 10); // 4-star = +10, 5-star = +20
    
    // Popularity bonus (more reviews = more popular)
    const popularityBonus = Math.min(Math.round(totalRatings / 50), 20);
    
    // Type-specific bonus
    const typeBonus = type === 'restaurant' ? 10 : type === 'cafe' ? 5 : 0;
    
    return Math.max(baseXP + ratingBonus + popularityBonus + typeBonus, 15);
  }

  // Get fame level based on XP points
  private getFameLevel(xpPoints: number): RealPlace['famousLevel'] {
    if (xpPoints >= 100) return 'legendary';
    if (xpPoints >= 75) return 'famous';
    if (xpPoints >= 50) return 'popular';
    return 'normal';
  }

  // Mock Google Places API call (replace with actual API)
  private async fetchGooglePlaces(area: IndoreArea, placeType: string): Promise<any[]> {
    // This is a mock - in real implementation, you'd use Google Places API
    const mockPlaces = [
      {
        place_id: `${area.name}_${placeType}_1`,
        name: placeType === 'restaurant' && area.name === 'Central Indore' ? 'Nafees Restaurant' : `${placeType} ${area.name} 1`,
        geometry: {
          location: {
            lat: area.center[1] + (Math.random() - 0.5) * 0.02,
            lng: area.center[0] + (Math.random() - 0.5) * 0.02
          }
        },
        rating: 3.5 + Math.random() * 1.5,
        user_ratings_total: Math.floor(Math.random() * 500) + 50,
        price_level: Math.floor(Math.random() * 4) + 1,
        vicinity: `${area.name}, Indore`,
        opening_hours: { open_now: Math.random() > 0.3 },
        photos: [],
        formatted_phone_number: "+91 731 " + Math.floor(Math.random() * 9000000 + 1000000)
      }
    ];

    // Add some famous places based on area
    if (area.name === 'Central Indore') {
      mockPlaces.push(
        {
          place_id: 'sarafa_bazaar',
          name: 'Sarafa Bazaar Night Market',
          geometry: { location: { lat: 22.7196, lng: 75.8577 } },
          rating: 4.8,
          user_ratings_total: 2500,
          price_level: 2,
          vicinity: 'Sarafa Bazaar, Indore',
          opening_hours: { open_now: true },
          photos: [],
          types: ['restaurant', 'food'],
          formatted_phone_number: "+91 731 2500000"
        },
        {
          place_id: 'chappan_dukan',
          name: 'Chappan Dukan Food Street',
          geometry: { location: { lat: 22.7240, lng: 75.8550 } },
          rating: 4.6,
          user_ratings_total: 1800,
          price_level: 2,
          vicinity: 'New Palasia, Indore',
          opening_hours: { open_now: true },
          photos: [],
          types: ['restaurant', 'food'],
          formatted_phone_number: "+91 731 2600000"
        }
      );
    }

    return mockPlaces;
  }

  // Convert place type to our internal types
  private mapPlaceType(googleTypes: string[]): RealPlace['type'] {
    if (googleTypes.includes('restaurant') || googleTypes.includes('meal_takeaway') || googleTypes.includes('food')) return 'restaurant';
    if (googleTypes.includes('cafe')) return 'cafe';
    if (googleTypes.includes('gym') || googleTypes.includes('fitness')) return 'gym';
    if (googleTypes.includes('bar') || googleTypes.includes('night_club')) return 'bar';
    if (googleTypes.includes('lodging') || googleTypes.includes('hotel')) return 'hotel';
    if (googleTypes.includes('beauty_salon') || googleTypes.includes('hair_care')) return 'parlour';
    return 'cafe'; // default
  }

  // Fetch real-time places for a specific area
  async fetchPlacesForArea(area: IndoreArea): Promise<RealPlace[]> {
    const cacheKey = `${area.name}_${area.center.join('_')}`;
    const now = Date.now();
    
    // Check cache first
    if (this.placesCache.has(cacheKey)) {
      const lastFetch = this.lastFetch.get(cacheKey) || 0;
      if (now - lastFetch < this.cacheTimeout) {
        return this.placesCache.get(cacheKey)!;
      }
    }

    console.log(`🔍 Fetching real-time places for ${area.name}...`);
    
    const places: RealPlace[] = [];
    const placeTypes = ['restaurant', 'cafe', 'gym', 'bar', 'hotel', 'beauty_salon'];

    try {
      // Fetch places for each type
      for (const placeType of placeTypes) {
        const googlePlaces = await this.fetchGooglePlaces(area, placeType);
        
        for (const gPlace of googlePlaces) {
          const mappedType = this.mapPlaceType(gPlace.types || [placeType]);
          const xpPoints = this.calculateXPPoints(
            gPlace.name,
            gPlace.rating || 3.5,
            gPlace.user_ratings_total || 0,
            mappedType
          );

          const realPlace: RealPlace = {
            id: gPlace.place_id,
            name: gPlace.name,
            type: mappedType,
            coordinates: [gPlace.geometry.location.lng, gPlace.geometry.location.lat],
            address: gPlace.vicinity || `${area.name}, Indore`,
            rating: Math.round((gPlace.rating || 3.5) * 10) / 10,
            totalRatings: gPlace.user_ratings_total || 0,
            priceLevel: (gPlace.price_level || 2) as 1 | 2 | 3 | 4,
            isOpen: gPlace.opening_hours?.open_now ?? true,
            phone: gPlace.formatted_phone_number,
            website: gPlace.website,
            photos: gPlace.photos?.map((photo: any) => photo.photo_reference) || [],
            xpPoints,
            famousLevel: this.getFameLevel(xpPoints),
            specialRewards: this.generateSpecialRewards(xpPoints, mappedType)
          };

          places.push(realPlace);
        }
      }

      // Cache the results
      this.placesCache.set(cacheKey, places);
      this.lastFetch.set(cacheKey, now);
      
      console.log(`✅ Fetched ${places.length} places for ${area.name}`);
      return places;

    } catch (error) {
      console.error('❌ Error fetching places:', error);
      return [];
    }
  }

  // Generate special rewards based on XP and type
  private generateSpecialRewards(xpPoints: number, type: RealPlace['type']): RealPlace['specialRewards'] {
    const rewards: RealPlace['specialRewards'] = [];

    if (xpPoints >= 100) {
      rewards.push({ type: 'points_multiplier', value: '2x XP for next 24hrs' });
      rewards.push({ type: 'discount', value: '20% off next visit' });
    } else if (xpPoints >= 75) {
      rewards.push({ type: 'discount', value: '15% off' });
      rewards.push({ type: 'freebie', value: 'Free dessert/drink' });
    } else if (xpPoints >= 50) {
      rewards.push({ type: 'discount', value: '10% off' });
    }

    // Type-specific rewards
    if (type === 'cafe') {
      rewards.push({ type: 'freebie', value: 'Free coffee upgrade' });
    } else if (type === 'restaurant') {
      rewards.push({ type: 'freebie', value: 'Free appetizer' });
    }

    return rewards;
  }

  // Fetch all places for Indore area
  async fetchAllIndorePlaces(): Promise<RealPlace[]> {
    console.log('🚀 Fetching all real-time places from Indore to IIT...');
    
    const allPlaces: RealPlace[] = [];
    
    // Fetch places from all areas
    for (const area of indoreAreas) {
      const areaPlaces = await this.fetchPlacesForArea(area);
      allPlaces.push(...areaPlaces);
    }

    // Remove duplicates and sort by XP points
    const uniquePlaces = allPlaces.filter((place, index, array) => 
      array.findIndex(p => p.name === place.name) === index
    );

    const sortedPlaces = uniquePlaces.sort((a, b) => b.xpPoints - a.xpPoints);
    
    console.log(`🎉 Total ${sortedPlaces.length} unique places loaded!`);
    console.log(`👑 Top 5 places:`, sortedPlaces.slice(0, 5).map(p => `${p.name} (${p.xpPoints}XP)`));
    
    return sortedPlaces;
  }

  // Calculate distance between user and place
  calculateDistance(userCoords: [number, number], placeCoords: [number, number]): number {
    const R = 6371; // Earth radius in km
    const dLat = (placeCoords[1] - userCoords[1]) * Math.PI / 180;
    const dLon = (placeCoords[0] - userCoords[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userCoords[1] * Math.PI / 180) * Math.cos(placeCoords[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get nearby places based on user location
  async getNearbyPlaces(userCoords: [number, number], radiusKm: number = 2): Promise<RealPlace[]> {
    const allPlaces = await this.fetchAllIndorePlaces();
    
    return allPlaces
      .map(place => ({
        ...place,
        distance: this.calculateDistance(userCoords, place.coordinates)
      }))
      .filter(place => place.distance! <= radiusKm)
      .sort((a, b) => a.distance! - b.distance!);
  }

  // Clear cache (useful for forcing refresh)
  clearCache() {
    this.placesCache.clear();
    this.lastFetch.clear();
    console.log('🧹 Places cache cleared');
  }
}

// Export singleton instance
export const realPlacesService = new RealPlacesService();
export default realPlacesService;
