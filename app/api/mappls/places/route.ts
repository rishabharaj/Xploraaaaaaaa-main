import { NextRequest, NextResponse } from 'next/server';
import { getAllIndorePlaces, searchPlacesByText, type MapplsPlace } from '@/lib/mappls-direct-api';

// GET /api/mappls/places - Get all Indore places
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Getting all Indore places from Mappls...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const location = searchParams.get('location') || '22.7196,75.8577'; // Indore center

    let places: MapplsPlace[] = [];

    if (query) {
      // Text search
      places = await searchPlacesByText(query, location);
    } else {
      // Get all places
      const allPlaces = await getAllIndorePlaces();
      places = [
        ...allPlaces.restaurants,
        ...allPlaces.cafes,
        ...allPlaces.bars,
        ...allPlaces.hotels,
        ...allPlaces.gyms,
        ...allPlaces.parlours
      ];

      // Filter by category if specified
      if (category) {
        places = places.filter(place => 
          place.categoryCode === category.toUpperCase()
        );
      }
    }

    console.log(`✅ API: Returning ${places.length} places`);

    return NextResponse.json({
      success: true,
      data: places,
      total: places.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Mappls places error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch places',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/mappls/places - Search places with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      location = '22.7196,75.8577', 
      radius = 10000, 
      categories = [], 
      query = '' 
    } = body;

    console.log('🔍 API: Searching places with filters:', { location, radius, categories, query });

    let places: MapplsPlace[] = [];

    if (query) {
      places = await searchPlacesByText(query, location);
    } else {
      const allPlaces = await getAllIndorePlaces();
      places = [
        ...allPlaces.restaurants,
        ...allPlaces.cafes,
        ...allPlaces.bars,
        ...allPlaces.hotels,
        ...allPlaces.gyms,
        ...allPlaces.parlours
      ];
    }

    // Apply category filters
    if (categories.length > 0) {
      places = places.filter(place => 
        categories.includes(place.categoryCode)
      );
    }

    // Apply distance filter
    if (radius < 50000) { // Only if reasonable radius
      const [userLng, userLat] = location.split(',').map(Number);
      places = places.filter(place => {
        const distance = calculateDistance(
          [userLng, userLat],
          [place.longitude, place.latitude]
        ) * 1000; // Convert to meters
        return distance <= radius;
      });
    }

    console.log(`✅ API: Filtered to ${places.length} places`);

    return NextResponse.json({
      success: true,
      data: places,
      total: places.length,
      filters: { location, radius, categories, query },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Place search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search places',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to calculate distance
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
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
