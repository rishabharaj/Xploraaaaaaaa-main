// Mappls Service for Geolocation API Integration
// Based on: https://developer.mappls.com/mapping/geolocation-api

export interface MapplsLocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  area?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

export interface MapplsRouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: {
    type: string;
    coordinates: number[][];
  };
  legs: Array<{
    steps: Array<{
      instruction: string;
      distance: number;
      duration: number;
    }>;
  }>;
}

export class MapplsService {
  private restApiKey: string;
  private baseUrl = 'https://apis.mappls.com/advancedmaps/v1';

  constructor(restApiKey: string) {
    this.restApiKey = restApiKey;
  }

  // Get current device location using Mappls Geolocation API
  async getCurrentLocation(): Promise<MapplsLocationResult | null> {
    try {
      // First try browser geolocation for immediate response
      const browserLocation = await this.getBrowserLocation();
      
      if (browserLocation) {
        // Get detailed address information from Mappls
        try {
          const addressInfo = await this.reverseGeocode(
            browserLocation.latitude, 
            browserLocation.longitude
          );
          
          return {
            ...browserLocation,
            ...addressInfo
          };
        } catch (error) {
          console.warn('Failed to get address info from Mappls:', error);
          return browserLocation;
        }
      }

      // Fallback to Mappls Geolocation API
      return await this.getMapplsLocation();
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Get location using browser's geolocation API
  private async getBrowserLocation(): Promise<MapplsLocationResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Browser geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    });
  }

  // Get location using Mappls Geolocation API
  private async getMapplsLocation(): Promise<MapplsLocationResult | null> {
    try {
      const url = `${this.baseUrl}/${this.restApiKey}/geo_location`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Mappls Geolocation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseCode === 200 && data.results) {
        return {
          latitude: data.results.latitude,
          longitude: data.results.longitude,
          accuracy: data.results.accuracy || 100,
          address: data.results.address,
          area: data.results.area,
          city: data.results.city,
          pincode: data.results.pincode,
          state: data.results.state
        };
      }

      return null;
    } catch (error) {
      console.error('Mappls Geolocation API error:', error);
      return null;
    }
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(lat: number, lng: number): Promise<Partial<MapplsLocationResult>> {
    try {
      const url = `${this.baseUrl}/${this.restApiKey}/rev_geocode?lat=${lat}&lng=${lng}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseCode === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted_address,
          area: result.area,
          city: result.city,
          pincode: result.pincode,
          state: result.state
        };
      }

      return {};
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
  }

  // Get route between two points using Mappls Directions API
  async getRoute(
    fromLat: number, 
    fromLng: number, 
    toLat: number, 
    toLng: number
  ): Promise<MapplsRouteResult | null> {
    try {
      const url = `${this.baseUrl}/${this.restApiKey}/route_adv/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&steps=true&overview=full`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Route API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseCode === 200 && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          legs: route.legs.map((leg: any) => ({
            steps: leg.steps.map((step: any) => ({
              instruction: step.maneuver.instruction || 'Continue',
              distance: step.distance,
              duration: step.duration
            }))
          }))
        };
      }

      return null;
    } catch (error) {
      console.error('Route API error:', error);
      return null;
    }
  }

  // Calculate straight-line distance between two points (fallback)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Search for places near a location
  async searchNearby(
    lat: number, 
    lng: number, 
    query: string, 
    radius: number = 1000
  ): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/${this.restApiKey}/textsearch?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseCode === 200 && data.suggestedLocations) {
        return data.suggestedLocations;
      }

      return [];
    } catch (error) {
      console.error('Search API error:', error);
      return [];
    }
  }
}

// Create singleton instance
export const createMapplsService = (apiKey?: string): MapplsService | null => {
  const key = apiKey || process.env.NEXT_PUBLIC_MAPPLS_REST_API_KEY;
  
  if (!key || key.includes('your-')) {
    console.warn('Mappls API key not configured');
    return null;
  }
  
  return new MapplsService(key);
};
