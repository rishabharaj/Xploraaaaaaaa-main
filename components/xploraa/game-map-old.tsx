"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Trophy, 
  Star, 
  Coffee, 
  Camera, 
  ShoppingBag,
  Target,
  Zap,
  Gift,
  Navigation,
  Route,
  Clock,
  Activity,
  Globe,
  Map
} from "lucide-react";
import { SimpleMapplsMap } from "./simple-mappls-map";
import { RealTimeLocation } from "./real-time-location";
import { realPlacesService, type RealPlace } from "@/lib/real-places-service";

interface GameMapProps {
  userPoints: number;
  onLocationVisit: (locationId: string, points: number) => void;
  visitedLocations: string[];
}

interface NavigationRoute {
  distance: string;
  duration: string;
  instructions: string[];
}

export function GameMap({ userPoints, onLocationVisit, visitedLocations }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  const [mapMode, setMapMode] = useState<"2D" | "3D">("2D");
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [useDemoMap, setUseDemoMap] = useState(false);
  const [mapplsService, setMapplsService] = useState<MapplsService | null>(null);
  const [realPlaces, setRealPlaces] = useState<RealPlace[]>([]);
  const [isMoving, setIsMoving] = useState(false);

  // Update nearby locations callback
  const updateNearbyLocations = useCallback((coords: [number, number]) => {
    const nearby = gameLocations.filter(location => {
      const distance = calculateDistance(
        coords, // user coords
        location.coordinates as [number, number]
      );
      return distance <= 5; // 5km radius
    });
    setNearbyLocations(nearby);
  }, []);

  // Initialize Mappls Service and check API keys
  useEffect(() => {
    const service = createMapplsService();
    setMapplsService(service);
    
    // Force demo mode for now to test real-time features - NO SDK LOADING
    console.log('🎮 Demo mode enabled - skipping Mappls SDK loading');
    setUseDemoMap(true);
    return; // Exit early to prevent any SDK loading
    
    // TODO: Re-enable Mappls integration once SDK loading is fixed
    /*
    const hasValidKeys = mapplsConfig.mapApiKey && 
                        mapplsConfig.restApiKey &&
                        !mapplsConfig.mapApiKey.includes('your-') &&
                        !mapplsConfig.restApiKey.includes('your-');
    
    if (!hasValidKeys || !service) {
      console.log('🎮 Using demo map - no valid Mappls API keys provided');
      setUseDemoMap(true);
    } else {
      console.log('🔑 Valid API keys found, attempting Mappls integration...');
      preloadMapplsSDK().catch(() => {
        console.log('🎮 Mappls failed, switching to demo mode');
        setUseDemoMap(true);
      });
      
      setTimeout(() => {
        if (!window.mappls) {
          console.log('⏰ Mappls timeout, using demo mode');
          setUseDemoMap(true);
        }
      }, 5000);
    }
    */
  }, []);

  // Initialize Mappls Map with proper error handling
  useEffect(() => {
    // Skip initialization if demo mode is active
    if (useDemoMap) {
      console.log('🎮 Skipping Mappls initialization - demo mode active');
      return;
    }
    
    if (mapRef.current && !mapInstance) {
      console.log('🗺️ Would initialize Mappls here, but demo mode is forced');
      // initializeMappls(); // Commented out for demo mode
    }
  }, [mapRef, mapInstance, visitedLocations, mapMode, useDemoMap]);

  // Real-time location tracking
  useEffect(() => {
    let watchId: number | null = null;

    if (realTimeTracking && navigator.geolocation) {
      console.log('🔴 Starting real-time location tracking...');
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          setUserLocation(newLocation);
          setIsMoving(position.coords.speed ? position.coords.speed > 0.5 : false);
          updateNearbyLocations(newLocation);
          
          console.log('📍 Location update:', {
            coords: newLocation,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
          });
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    } else if (!realTimeTracking && watchId) {
      navigator.geolocation.clearWatch(watchId);
      console.log('🔴 Stopped real-time location tracking');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [realTimeTracking, updateNearbyLocations]);

  // Load real places when component mounts
  useEffect(() => {
    const loadRealPlaces = async () => {
      try {
        console.log('🏪 Loading real places from Indore...');
        const places = await realPlacesService.fetchAllIndorePlaces();
        setRealPlaces(places);
        console.log(`✅ Loaded ${places.length} real places`);
      } catch (error) {
        console.error('❌ Failed to load real places:', error);
      }
    };

    loadRealPlaces();
  }, []);

  const preloadMapplsSDK = async () => {
    // Disabled for demo mode testing
    console.log('⏭️ SDK preloading skipped - demo mode active');
    return;
    /*
    try {
      console.log('🔍 Pre-loading Mappls SDK...');
      await loadMapplsSDK();
      console.log('✅ Mappls SDK pre-loaded successfully');
    } catch (error) {
      console.warn('⚠️ SDK pre-load failed, using demo map:', error);
      setUseDemoMap(true);
    }
    */
  };

  // If using demo map, render the demo component
  if (useDemoMap) {
    return (
      <div className="relative w-full h-full">
        <DemoMap 
          userPoints={userPoints}
          onLocationVisit={onLocationVisit}
          visitedLocations={visitedLocations}
        />
        <div className="absolute top-4 right-4 z-50">
          <Card className="bg-amber-100 border-2 border-amber-300 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-amber-800">Demo Mode</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Add Mappls API keys for live map
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const initializeMappls = async () => {
    if (!mapRef.current || useDemoMap) {
      console.log('🎮 Skipping Mappls initialization - demo mode active');
      return;
    }
    
    console.log('🚀 Starting simplified Mappls initialization...');
    
    try {
      // Load SDK with minimal settings
      await loadMapplsSDK();
      
      // Verify SDK loaded
      if (!window.mappls || !window.mappls.Map) {
        throw new Error('Mappls SDK not loaded');
      }
      console.log('✅ SDK loaded');
      
      // Basic map configuration
      const mapOptions = {
        center: indoreConfig.center,
        zoom: indoreConfig.zoom,
        zoomControl: true
      };
      
      console.log('🗺️ Creating map...');
      
      // Create map
      const map = new window.mappls.Map(mapRef.current, mapOptions);
      
      if (!map) {
        throw new Error('Map creation failed');
      }
      
      // Simple timeout to ensure map loads
      setTimeout(() => {
        console.log('⏰ Adding markers after delay...');
        
        // Add simple markers without complex async
        gameLocations.forEach((location, index) => {
          try {
            // Create simple HTML element
            const el = document.createElement('div');
            el.style.cssText = `
              background: #3B82F6; 
              color: white; 
              padding: 8px; 
              border-radius: 50%; 
              width: 32px; 
              height: 32px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold;
              cursor: pointer;
            `;
            el.textContent = location.rewards.points.toString();
            
            // Create marker
            const marker = new window.mappls.Marker({
              element: el,
              anchor: 'center'
            });
            
            // Set position and add to map
            marker.setLngLat([location.coordinates[0], location.coordinates[1]]);
            marker.addTo(map);
            
            console.log(`✅ Added marker: ${location.name}`);
            
          } catch (markerError) {
            console.warn('⚠️ Marker failed:', location.name, markerError);
          }
        });
        
        setMapInstance(map);
        console.log('🎉 Map initialization complete!');
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Mappls failed:', error);
      console.log('🔄 Switching to demo map');
      setUseDemoMap(true);
    }
  };

  const loadMapplsSDK = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.mappls && window.mappls.Map) {
        console.log('✅ Mappls already loaded');
        resolve();
        return;
      }

      console.log('📦 Loading Mappls SDK...');

      // Try the basic Mappls SDK URL without API key in URL
      const script = document.createElement('script');
      script.src = `https://apis.mappls.com/advancedmaps/api/js?v=3.0&key=${mapplsConfig.mapApiKey}`;
      script.crossOrigin = 'anonymous';
      
      let resolved = false;
      
      script.onload = () => {
        if (resolved) return;
        console.log('📦 Script loaded successfully');
        
        // Check if mappls object is available
        const checkMappls = () => {
          if (window.mappls && window.mappls.Map) {
            resolved = true;
            console.log('✅ Mappls SDK ready');
            resolve();
          } else {
            // Try to initialize manually
            setTimeout(() => {
              if (window.mappls && window.mappls.Map) {
                resolved = true;
                console.log('✅ Mappls SDK ready after delay');
                resolve();
              } else if (!resolved) {
                resolved = true;
                console.log('⚠️ Mappls SDK timeout, switching to demo mode');
                reject(new Error('SDK initialization timeout'));
              }
            }, 2000);
          }
        };
        
        checkMappls();
      };

      script.onerror = (error) => {
        if (resolved) return;
        resolved = true;
        console.error('❌ Mappls script load failed:', error);
        console.log('🔄 Switching to demo mode due to script error');
        reject(new Error('Script load failed'));
      };

      // Add timeout fallback
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log('⏰ SDK loading timeout, switching to demo mode');
          reject(new Error('Loading timeout'));
        }
      }, 10000);

      document.head.appendChild(script);
    });
  };

  const addUserLocationMarker = (map: any) => {
    if (!userLocation || !map) return;

    try {
      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'user-location-marker';
      userMarkerEl.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
        "></div>
      `;

      new window.mappls.Marker({
        element: userMarkerEl,
        anchor: 'center'
      })
      .setLngLat(userLocation)
      .addTo(map);

      console.log('User location marker added successfully');
    } catch (error) {
      console.warn('Could not add user location marker:', error);
    }
  };

  const addGameLocationMarkersAsync = async (map: any): Promise<void> => {
    if (!map || !window.mappls || !window.mappls.Marker) {
      console.warn('❌ Map or Mappls SDK not available for adding markers');
      throw new Error('Map or Mappls Marker not available');
    }

    console.log('🎯 Starting to add game location markers...');

    return new Promise((resolve) => {
      let addedCount = 0;
      let errorCount = 0;

      gameLocations.forEach((location, index) => {
        // Add a small delay for each marker to avoid overwhelming the map
        setTimeout(async () => {
          try {
            const isVisited = visitedLocations.includes(location.id);
            
            // Validate coordinates first
            const lng = typeof location.coordinates[0] === 'string' 
              ? parseFloat(location.coordinates[0]) 
              : location.coordinates[0];
            const lat = typeof location.coordinates[1] === 'string' 
              ? parseFloat(location.coordinates[1]) 
              : location.coordinates[1];
            
            if (isNaN(lng) || isNaN(lat)) {
              console.error('❌ Invalid coordinates for location:', location.name, location.coordinates);
              errorCount++;
              return;
            }

            // Double-check that Mappls is still available
            if (!window.mappls || !window.mappls.Marker) {
              console.error('❌ Mappls Marker became unavailable during marker creation');
              errorCount++;
              return;
            }

            // Create custom marker element
            const markerElement = document.createElement('div');
            markerElement.className = `game-marker ${isVisited ? 'visited' : 'unvisited'}`;
            markerElement.innerHTML = `
              <div class="marker-pulse ${isVisited ? 'pulse-green' : 'pulse-red'}"></div>
              <div class="marker-icon">
                ${getLocationEmoji(location.type)}
              </div>
              <div class="marker-badge">
                ${location.rewards.points} XP
              </div>
            `;
            markerElement.style.cssText = `
              position: relative;
              width: 60px;
              height: 60px;
              cursor: pointer;
              z-index: 10;
            `;

            // Create the marker with error handling
            let marker;
            try {
              marker = new window.mappls.Marker({
                element: markerElement,
                anchor: 'bottom'
              });
            } catch (markerCreateError) {
              console.error('❌ Failed to create Mappls marker:', markerCreateError);
              errorCount++;
              return;
            }

            if (!marker) {
              console.error('❌ Marker creation returned null for:', location.name);
              errorCount++;
              return;
            }

            // Set coordinates
            try {
              marker.setLngLat([lng, lat]);
            } catch (coordError) {
              console.error('❌ Failed to set coordinates for marker:', location.name, coordError);
              errorCount++;
              return;
            }

            // Try to add to map with comprehensive error handling
            try {
              // Check if map is still valid and has required methods
              if (!map || typeof map.getContainer !== 'function') {
                console.error('❌ Map container is invalid for:', location.name);
                errorCount++;
                return;
              }

              marker.addTo(map);
              
              // Add click handler after successful addition
              markerElement.addEventListener('click', () => {
                try {
                  handleLocationClick(location, map);
                } catch (clickError) {
                  console.error('❌ Error handling location click:', clickError);
                }
              });
              
              addedCount++;
              console.log(`✅ Added marker ${addedCount}/${gameLocations.length}: ${location.name}`);
              
            } catch (addError) {
              console.error('❌ Failed to add marker to map:', location.name, addError);
              // If it's a container error, let's try a fallback
              if ((addError as Error).message && (addError as Error).message.includes('getCanvasContainer')) {
                console.log('🔄 Container error detected, waiting and retrying...');
                setTimeout(() => {
                  try {
                    marker.addTo(map);
                    addedCount++;
                    console.log(`✅ Retry successful for: ${location.name}`);
                  } catch (retryError) {
                    console.error('❌ Retry also failed for:', location.name);
                    errorCount++;
                  }
                }, 1000);
              } else {
                errorCount++;
              }
            }

          } catch (error) {
            console.error('❌ Error in marker creation process for:', location.name, error);
            errorCount++;
          }

          // Check if we've processed all markers
          if (addedCount + errorCount === gameLocations.length) {
            console.log(`🎯 Marker addition completed: ${addedCount} successful, ${errorCount} failed`);
            if (addedCount > 0) {
              console.log('✅ At least some markers were added successfully');
            }
            resolve();
          }

        }, index * 300); // Stagger marker creation by 300ms each
      });
    });
  };

  const showMapError = (message: string) => {
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-lg">
          <div class="text-center p-8 max-w-md">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-bold text-orange-800 mb-2">Map Loading Issue</h3>
            <p class="text-orange-700 mb-6 text-sm">${message}</p>
            
            <div class="space-y-3">
              <button 
                onclick="window.location.reload()" 
                class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                🔄 Retry Loading Map
              </button>
              
              <button 
                onclick="document.querySelector('[data-demo-map]')?.click()" 
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🎮 Use Demo Mode
              </button>
            </div>
            
            <div class="mt-4 text-xs text-orange-600">
              <p>• Check your internet connection</p>
              <p>• Verify API keys are correct</p>
              <p>• Try demo mode for offline use</p>
            </div>
          </div>
        </div>
      `;
    }
  };

  // Add demo mode toggle function
  const switchToDemoMode = () => {
    console.log('Switching to demo mode...');
    setUseDemoMap(true);
    setMapInstance(null);
  };

  const getLocationEmoji = (type: string) => {
    const icons: { [key: string]: string } = {
      cafe: "☕",
      landmark: "🏛️",
      shopping: "🛍️",
      restaurant: "🍽️",
      park: "🌳"
    };
    return icons[type] || "📍";
  };

  const handleLocationClick = async (location: any, map: any) => {
    setSelectedLocation(location);
    
    if (!visitedLocations.includes(location.id) && userLocation) {
      const distance = calculateDistance(userLocation, location.coordinates as [number, number]);
      
      if (distance <= 0.1) { // Within 100 meters
        handleLocationVisit(location);
      } else {
        // Show navigation route
        await showNavigationRoute(userLocation, location.coordinates, location.name, map);
      }
    }
  };

  const showNavigationRoute = async (from: [number, number], to: [number, number], locationName: string, map: any) => {
    setIsNavigating(true);
    
    try {
      if (mapplsService) {
        // Use Mappls Directions API through our service
        const route = await mapplsService.getRoute(from[1], from[0], to[1], to[0]);
        
        if (route) {
          // Set route information with proper formatting
          setCurrentRoute({
            distance: `${(route.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(route.duration / 60)} min`,
            instructions: route.legs[0]?.steps.slice(0, 5).map(step => step.instruction) || []
          });
          
          console.log('Route calculated:', route);
          return;
        }
      }
      
      // Fallback: straight line distance
      const distance = calculateDistance(from, to);
      setCurrentRoute({
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(distance * 15)} min`, // Approximate walking time
        instructions: [
          `Head ${getDirection(from, to)} towards ${locationName}`,
          `Continue straight for ${distance.toFixed(1)} km`,
          'You will arrive at your destination'
        ]
      });
      
    } catch (error: any) {
      console.error('Error getting route:', error);
      // Fallback route info
      const distance = calculateDistance(from, to);
      setCurrentRoute({
        distance: `${distance.toFixed(1)} km`,
        duration: `${Math.round(distance * 15)} min`,
        instructions: [`Navigate to ${locationName}`, 'You have arrived']
      });
    }
  };

  const getDirection = (from: [number, number], to: [number, number]): string => {
    const bearing = Math.atan2(to[0] - from[0], to[1] - from[1]) * 180 / Math.PI;
    const normalized = (bearing + 360) % 360;
    
    if (normalized < 45 || normalized >= 315) return "north";
    if (normalized < 135) return "east";
    if (normalized < 225) return "south";
    return "west";
  };

  const handleLocationVisit = (location: any) => {
    setCurrentReward({
      points: location.rewards.points,
      coupon: location.rewards.coupon,
      badge: location.rewards.badge,
      location: location.name
    });
    
    setShowRewardAnimation(true);
    onLocationVisit(location.id, location.rewards.points);
    
    // Hide animation after 4 seconds
    setTimeout(() => {
      setShowRewardAnimation(false);
      setCurrentRoute(null);
      setIsNavigating(false);
    }, 4000);
  };

  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleMapMode = () => {
    setMapMode(prev => prev === "2D" ? "3D" : "2D");
    // For now, just change the state - actual 3D implementation will be added later
    console.log(`Map mode switched to: ${mapMode === "2D" ? "3D" : "2D"}`);
  };

  const toggleRealTimeTracking = async () => {
    setRealTimeTracking(prev => !prev);
    
    if (!realTimeTracking && mapplsService) {
      try {
        // Start real-time location tracking
        const location = await mapplsService.getCurrentLocation();
        if (location) {
          const coords: [number, number] = [location.longitude, location.latitude];
          setUserLocation(coords);
          updateNearbyLocations(coords);
          
          console.log('Real-time tracking enabled, location:', coords);
        }
        
        // Set up continuous tracking using browser geolocation
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
              setUserLocation(coords);
              updateNearbyLocations(coords);
              console.log('Location updated:', coords);
            },
            (error) => console.error("Geolocation error:", error),
            { 
              enableHighAccuracy: true, 
              timeout: 5000, 
              maximumAge: 1000 
            }
          );
          
          // Store watch ID for cleanup
          if (mapInstance) {
            (mapInstance as any)._watchId = watchId;
          }
        }
      } catch (error: any) {
        console.error('Error starting location tracking:', error);
      }
    } else if (mapInstance && (mapInstance as any)._watchId) {
      // Stop tracking
      navigator.geolocation.clearWatch((mapInstance as any)._watchId);
      (mapInstance as any)._watchId = null;
      console.log('Real-time tracking disabled');
    }
  };

  const currentLevel = getUserLevel(userPoints);

  return (
    <div className="relative w-full h-full bg-slate-100">
      {/* Enhanced Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white"
        style={{ minHeight: "600px" }}
      >
        <style jsx>{`
          .game-marker {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .marker-pulse {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            position: absolute;
            top: 10px;
            animation: pulse 2s infinite;
          }
          
          .pulse-red {
            background: rgba(239, 68, 68, 0.3);
            border: 2px solid #EF4444;
          }
          
          .pulse-green {
            background: rgba(16, 185, 129, 0.3);
            border: 2px solid #10B981;
          }
          
          .marker-icon {
            background: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
            z-index: 2;
          }
          
          .marker-badge {
            background: #3B82F6;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            margin-top: 4px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            70% {
              transform: scale(1.5);
              opacity: 0.3;
            }
            100% {
              transform: scale(1.8);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {/* Enhanced Game UI Overlay */}
      <div className="absolute top-6 left-6 space-y-4">
        {/* User Stats - Enhanced */}
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-blue-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge 
                    className="text-xs font-bold text-white shadow-md px-3 py-1" 
                    style={{ backgroundColor: currentLevel.color }}
                  >
                    {currentLevel.name} Level
                  </Badge>
                  <span className="text-lg font-bold text-slate-800">{userPoints.toLocaleString()} pts</span>
                </div>
                <Progress 
                  value={(userPoints % 1000) / 10} 
                  className="w-32 h-2 bg-slate-200"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {1000 - (userPoints % 1000)} pts to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Controls - Enhanced */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleMapMode}
            className="bg-white/95 backdrop-blur-lg border-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold shadow-lg"
          >
            {mapMode === "2D" ? "🌍 Switch to 3D" : "🗺️ Switch to 2D"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleRealTimeTracking}
            className={cn(
              "backdrop-blur-lg border-2 font-semibold shadow-lg",
              realTimeTracking 
                ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200" 
                : "bg-white/95 border-slate-300 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Activity className="w-4 h-4 mr-2" />
            {realTimeTracking ? "Live Tracking ON" : "Enable Live Tracking"}
          </Button>
          {!useDemoMap && (
            <Button
              variant="secondary"
              size="sm"
              onClick={switchToDemoMode}
              className="bg-white/95 backdrop-blur-lg border-2 border-amber-200 hover:bg-amber-50 text-amber-700 font-semibold shadow-lg"
              data-demo-map
            >
              🎮 Demo Mode
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Panel - Enhanced with real-time info */}
      {currentRoute && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-6 right-6"
        >
          <Card className="bg-white/95 backdrop-blur-lg border-2 border-blue-200 shadow-xl w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
                Navigation Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-800">{currentRoute.distance}</div>
                  <div className="text-xs text-blue-600 font-semibold">Distance</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-800">{currentRoute.duration}</div>
                  <div className="text-xs text-green-600 font-semibold">Est. Time</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Turn-by-Turn Directions:
                </h4>
                {currentRoute.instructions.slice(0, 3).map((instruction, index) => (
                  <div key={index} className="text-xs text-slate-700 p-2 bg-slate-50 rounded-lg">
                    <span className="font-bold text-blue-600">{index + 1}.</span> {instruction}
                  </div>
                ))}
              </div>
              
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg"
                onClick={() => {
                  setCurrentRoute(null);
                  setIsNavigating(false);
                }}
              >
                <Target className="w-4 h-4 mr-2" />
                End Navigation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Nearby Locations Panel - Enhanced */}
      {nearbyLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-6"
        >
          <Card className="bg-white/95 backdrop-blur-lg border-2 border-green-200 shadow-xl w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full animate-pulse">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                Nearby Rewards ({nearbyLocations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-48 overflow-y-auto">
              {nearbyLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleLocationClick(location, mapInstance)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getLocationEmoji(location.type)}</div>
                      <div>
                        <div className="font-semibold text-green-800 text-sm">{location.name}</div>
                        <div className="text-xs text-green-600">
                          📍 {location.distance?.toFixed(2)} km away
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600">
                        +{location.rewards.points} XP
                      </div>
                      <div className="text-xs text-slate-600">
                        {location.rewards.coupon.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Real-time Location Status */}
      {userLocation && realTimeTracking && (
        <div className="absolute bottom-6 right-6">
          <Card className="bg-white/95 backdrop-blur-lg border-2 border-indigo-200 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-sm font-semibold text-indigo-800">Live Location Active</div>
                  <div className="text-xs text-slate-600">
                    📍 {userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-Time Location Panel */}
      {realTimeTracking && (
        <div className="absolute bottom-6 left-6 max-w-sm z-40">
          <RealTimeLocation
            userLocation={userLocation}
            onPlaceSelect={(place) => {
              console.log('Selected place:', place);
              // Could add navigation to this place
            }}
            onLocationVisit={(placeId, xpPoints) => {
              console.log(`Visited ${placeId}, earned ${xpPoints} XP`);
              onLocationVisit(placeId, xpPoints);
            }}
            isMoving={isMoving}
          />
        </div>
      )}

      {/* Enhanced Reward Animation */}
      <AnimatePresence>
        {showRewardAnimation && currentReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-4 border-yellow-400 max-w-lg shadow-2xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <Gift className="w-10 h-10 text-purple-800" />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-3">🎉 Reward Unlocked!</h2>
                  <p className="text-xl text-yellow-300 mb-6 font-semibold">{currentReward.location}</p>
                  
                  <div className="space-y-3 text-white">
                    <motion.div 
                      className="flex items-center justify-center gap-3 bg-white/20 rounded-xl p-4"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Star className="w-6 h-6 text-yellow-300" />
                      <span className="text-xl font-bold">+{currentReward.points} Experience Points</span>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-4"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div className="text-lg font-semibold">
                        🎟️ {currentReward.coupon}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-4"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <div className="text-lg">
                        🏆 Achievement: {currentReward.badge}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                  className="mt-6"
                >
                  <div className="text-sm text-yellow-200">
                    Keep exploring to unlock more rewards! 🚀
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add global Mappls type declaration
declare global {
  interface Window {
    mappls: any;
  }
}