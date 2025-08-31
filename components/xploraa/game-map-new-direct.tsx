"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Map,
  Layers,
  RefreshCw
} from "lucide-react";
import { 
  indoreConfig, 
  gameLocations, 
  achievements,
  getUserLevel
} from "@/lib/mappls-config";
import { RealTimeLocation } from "./real-time-location";
import { realPlacesService, type RealPlace } from "@/lib/real-places-service";
import { getAllIndorePlaces, type MapplsPlace, searchIndorePlaces } from "@/lib/mappls-direct-api";

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
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [realPlaces, setRealPlaces] = useState<RealPlace[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [mapplsPlaces, setMapplsPlaces] = useState<MapplsPlace[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [useMapView, setUseMapView] = useState<'mappls' | 'satellite' | 'hybrid'>('mappls');

  // Calculate distance between two coordinates
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

  // Initialize Direct Mappls Map
  const initializeDirectMappls = async () => {
    if (!mapRef.current) return;

    console.log('🗺️ Loading Direct Mappls Map (Real Integration)...');
    setMapLoading(true);
    
    try {
      // Clear any existing content
      mapRef.current.innerHTML = '';

      // Create the main map container
      const mapContainer = document.createElement('div');
      mapContainer.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      `;

      // Method 1: Try Mappls Direct Embed (most reliable)
      let mapLoaded = false;
      
      if (useMapView === 'mappls') {
        try {
          const mapFrame = document.createElement('iframe');
          mapFrame.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: white;
          `;
          
          // Try official Mappls embed URL
          const embedUrl = `https://maps.mappls.com/embed?` + new URLSearchParams({
            lat: indoreConfig.center[1].toString(),
            lng: indoreConfig.center[0].toString(),
            zoom: indoreConfig.zoom.toString(),
            layer: 'vector',
            traffic: 'true',
            places: 'true'
          }).toString();

          mapFrame.src = embedUrl;
          mapContainer.appendChild(mapFrame);
          mapLoaded = true;
          console.log('✅ Mappls iframe embed loaded');
          
        } catch (error) {
          console.log('⚠️ Mappls embed failed, trying alternative...');
        }
      }

      // Method 2: If Mappls fails, use Google Maps embed as fallback
      if (!mapLoaded || useMapView === 'satellite') {
        const googleFrame = document.createElement('iframe');
        googleFrame.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        `;
        
        const googleUrl = `https://www.google.com/maps/embed/v1/view?` + new URLSearchParams({
          key: 'AIzaSyBEyFQnWnJAhvdnw_DzF9LStBKZ0Hq-wAs', // Public embed key
          center: `${indoreConfig.center[1]},${indoreConfig.center[0]}`,
          zoom: indoreConfig.zoom.toString(),
          maptype: useMapView === 'satellite' ? 'satellite' : 'roadmap'
        }).toString();

        googleFrame.src = googleUrl;
        mapContainer.appendChild(googleFrame);
        console.log('🌍 Google Maps fallback loaded');
      }

      // Method 3: Final fallback to OpenStreetMap
      if (!mapLoaded && useMapView === 'hybrid') {
        const osmFrame = document.createElement('iframe');
        osmFrame.style.cssText = `
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        `;
        
        const osmUrl = `https://www.openstreetmap.org/export/embed.html?` + new URLSearchParams({
          bbox: `${indoreConfig.center[0]-0.05},${indoreConfig.center[1]-0.05},${indoreConfig.center[0]+0.05},${indoreConfig.center[1]+0.05}`,
          layer: 'mapnik',
          marker: `${indoreConfig.center[1]},${indoreConfig.center[0]}`
        }).toString();

        osmFrame.src = osmUrl;
        mapContainer.appendChild(osmFrame);
        console.log('🗺️ OpenStreetMap loaded');
      }

      mapRef.current.appendChild(mapContainer);

      // Add custom markers overlay after map loads
      setTimeout(() => {
        addCustomMarkersOverlay();
        setMapLoading(false);
      }, 2000);

      console.log('✅ Map initialization complete!');
      
    } catch (error) {
      console.error('❌ Map initialization failed:', error);
      setMapLoading(false);
    }
  };

  // Load real Indore places from Mappls API
  const loadMapplsPlaces = async () => {
    try {
      console.log('🏪 Loading real Indore places from Mappls API...');
      const allPlaces = await getAllIndorePlaces();
      
      // Convert to array for easier handling
      const placesArray = [
        ...allPlaces.restaurants,
        ...allPlaces.cafes,
        ...allPlaces.bars,
        ...allPlaces.hotels,
        ...allPlaces.gyms,
        ...allPlaces.parlours
      ];
      
      setMapplsPlaces(placesArray);
      console.log(`✅ Loaded ${placesArray.length} real places from Mappls`);
      
    } catch (error) {
      console.error('❌ Failed to load Mappls places:', error);
    }
  };

  // Add custom markers as overlay on the map
  const addCustomMarkersOverlay = () => {
    if (!mapRef.current) return;

    const markersContainer = document.createElement('div');
    markersContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    `;

    // Add real Mappls places markers
    mapplsPlaces.forEach((place, index) => {
      const marker = document.createElement('div');
      marker.style.cssText = `
        position: absolute;
        left: ${45 + (index % 6) * 8}%;
        top: ${35 + Math.floor(index / 6) * 12}%;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #FF6B6B, #FF8E53);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        border: 2px solid white;
        animation: ${index % 3 === 0 ? 'bounce' : 'none'} 3s infinite;
      `;
      
      // Get category icon
      const categoryIcon = place.categoryCode === 'RESTRNT' ? '🍽️' : 
                          place.categoryCode === 'COFFEE' ? '☕' :
                          place.categoryCode === 'BAR' ? '🍺' :
                          place.categoryCode === 'HOTEL' ? '🏨' :
                          place.categoryCode === 'SPORTS' ? '🏋️' :
                          place.categoryCode === 'BEAUTY' ? '💅' : '🏪';
      
      marker.innerHTML = categoryIcon;

      marker.addEventListener('click', () => {
        console.log('🏪 Clicked real place:', place.placeName);
        handleRealPlaceClick(place);
      });

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.3)';
        marker.style.zIndex = '15';
        
        // Show enhanced tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.95);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          white-space: nowrap;
          margin-bottom: 8px;
          max-width: 250px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
        `;
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 4px;">${place.placeName}</div>
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${Math.round(place.distance)}m away</div>
          ${place.rating ? `<div style="color: gold; font-size: 12px;">⭐ ${place.rating} stars</div>` : ''}
          <div style="color: #4ADE80; font-size: 11px; margin-top: 4px;">Click for XP!</div>
        `;
        marker.appendChild(tooltip);
      });

      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        marker.style.zIndex = '5';
        const tooltip = marker.querySelector('div[style*="bottom: 100%"]');
        if (tooltip) tooltip.remove();
      });

      markersContainer.appendChild(marker);
    });

    // Add game location markers
    gameLocations.forEach((location, index) => {
      const marker = document.createElement('div');
      marker.style.cssText = `
        position: absolute;
        left: ${50 + (Math.random() - 0.5) * 70}%;
        top: ${50 + (Math.random() - 0.5) * 70}%;
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        animation: bounce 2s infinite;
        border: 3px solid white;
        z-index: 6;
      `;
      
      marker.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 12px; line-height: 1;">${location.rewards.points}</div>
          <div style="font-size: 8px; line-height: 1;">XP</div>
        </div>
      `;

      marker.addEventListener('click', () => {
        setSelectedLocation(location);
        handleLocationClick(location);
      });

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.15)';
      });

      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
      });

      markersContainer.appendChild(marker);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = document.createElement('div');
      userMarker.style.cssText = `
        position: absolute;
        left: 52%;
        top: 52%;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.6);
        transform: translate(-50%, -50%);
        z-index: 15;
        animation: pulse 2s infinite;
      `;
      
      // Add movement indicator
      if (isMoving) {
        const movementRing = document.createElement('div');
        movementRing.style.cssText = `
          position: absolute;
          top: -8px;
          left: -8px;
          width: 40px;
          height: 40px;
          border: 2px solid #10B981;
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        `;
        userMarker.appendChild(movementRing);
      }
      
      markersContainer.appendChild(userMarker);
    }

    mapRef.current.appendChild(markersContainer);

    // Add custom CSS for animations
    if (!document.getElementById('map-animations')) {
      const style = document.createElement('style');
      style.id = 'map-animations';
      style.textContent = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          40% {
            transform: translate(-50%, -50%) translateY(-8px);
          }
          60% {
            transform: translate(-50%, -50%) translateY(-4px);
          }
        }
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Handle real place click
  const handleRealPlaceClick = (place: MapplsPlace) => {
    console.log('🏪 Real place selected:', place.placeName);
    
    // Calculate XP based on place category and rating
    let xpPoints = 30; // Base XP for real places
    
    // Category bonuses
    if (place.categoryCode === 'RESTRNT') xpPoints += 20; // Restaurants get more XP
    if (place.categoryCode === 'COFFEE') xpPoints += 15; // Cafes
    if (place.categoryCode === 'BAR') xpPoints += 25; // Bars
    if (place.categoryCode === 'HOTEL') xpPoints += 35; // Hotels
    if (place.categoryCode === 'SPORTS') xpPoints += 40; // Gyms
    if (place.categoryCode === 'BEAUTY') xpPoints += 30; // Parlours
    
    // Rating bonus
    if (place.rating && place.rating > 4.0) xpPoints += 25;
    if (place.rating && place.rating > 4.5) xpPoints += 15; // Extra bonus for excellent places
    
    // Distance bonus (closer = more XP)
    if (place.distance < 500) xpPoints += 20; // Very close
    else if (place.distance < 1000) xpPoints += 10; // Close
    
    // Famous Indore places get special XP
    const famousPlaces = ['sarafa', 'chappan', 'nafees', 'phoenix', 'treasure'];
    if (famousPlaces.some(famous => place.placeName.toLowerCase().includes(famous))) {
      xpPoints += 50; // Bonus for famous places
    }
    
    // Simulate visit
    const reward = {
      id: place.mapplsPin || `place_${Date.now()}`,
      name: place.placeName,
      rewards: {
        points: xpPoints,
        coupon: `Special offer at ${place.placeName}`,
        badge: `${place.placeName} Explorer`
      }
    };
    
    handleLocationVisit(reward);
  };

  // Handle location click
  const handleLocationClick = (location: any) => {
    console.log('📍 Game location clicked:', location.name);
    
    if (!visitedLocations.includes(location.id)) {
      // Check if user is close enough or allow demo visit
      if (userLocation) {
        const distance = calculateDistance(userLocation, location.coordinates);
        if (distance <= 0.1) { // Within 100m
          handleLocationVisit(location);
        } else {
          console.log(`📏 Too far from location: ${distance.toFixed(2)}km`);
          // For demo, allow visit anyway
          handleLocationVisit(location);
        }
      } else {
        // No location, allow demo visit
        handleLocationVisit(location);
      }
    }
  };

  // Handle location visit with rewards
  const handleLocationVisit = (location: any) => {
    console.log('🎉 Location visited:', location.name);
    
    onLocationVisit(location.id, location.rewards.points);
    
    setCurrentReward({
      location: location.name,
      points: location.rewards.points,
      coupon: location.rewards.coupon,
      badge: location.rewards.badge
    });
    
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 5000);
  };

  // Initialize map on component mount
  useEffect(() => {
    if (mapRef.current) {
      initializeDirectMappls();
    }
    
    // Load real places data
    loadMapplsPlaces();
  }, [useMapView]);

  // Real-time location tracking with movement detection
  useEffect(() => {
    let watchId: number | null = null;
    let lastPosition: [number, number] | null = null;
    let lastMoveTime = Date.now();

    if (realTimeTracking && navigator.geolocation) {
      console.log('📡 Starting real-time location tracking...');
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          // Detect movement
          if (lastPosition) {
            const distance = calculateDistance(lastPosition, newLocation);
            const timeDiff = Date.now() - lastMoveTime;
            const speed = distance / (timeDiff / 1000 / 3600); // km/h
            
            setIsMoving(speed > 1); // Moving if > 1 km/h
            
            if (distance > 0.01) { // Moved at least 10m
              lastPosition = newLocation;
              lastMoveTime = Date.now();
              updateNearbyLocations(newLocation);
            }
          } else {
            lastPosition = newLocation;
            updateNearbyLocations(newLocation);
          }
          
          setUserLocation(newLocation);
          
          console.log('📍 Location update:', {
            coords: newLocation,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            moving: isMoving
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
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('📡 Stopped location tracking');
      }
    };
  }, [realTimeTracking, updateNearbyLocations, isMoving]);

  // Load real places data from service
  useEffect(() => {
    const loadRealPlaces = async () => {
      try {
        console.log('🏪 Loading real places from service...');
        const places = await realPlacesService.fetchAllIndorePlaces();
        setRealPlaces(places);
        console.log(`✅ Loaded ${places.length} real places from service`);
      } catch (error) {
        console.error('❌ Failed to load real places:', error);
      }
    };

    loadRealPlaces();
  }, []);

  const currentLevel = getUserLevel(userPoints);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative"
        style={{ minHeight: "600px" }}
      >
        {mapLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center z-20">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Real Mappls Map</h3>
              <p className="text-sm text-slate-600">Preparing Indore area with real places...</p>
            </div>
          </div>
        )}
      </div>

      {/* Game UI Overlay */}
      <div className="absolute top-6 left-6 space-y-4 z-20">
        {/* User Stats */}
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

        {/* Map Stats */}
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-green-200 shadow-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{mapplsPlaces.length}</div>
              <div className="text-xs text-slate-600">Real Places Found</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <div className="absolute top-6 right-6 space-y-3 z-20">
        {/* Live Tracking Toggle */}
        <Button
          variant={realTimeTracking ? "default" : "secondary"}
          size="sm"
          onClick={() => setRealTimeTracking(!realTimeTracking)}
          className={cn(
            "bg-white/95 backdrop-blur-lg border-2 font-semibold shadow-lg transition-all",
            realTimeTracking 
              ? "border-green-400 text-green-700 bg-green-50 hover:bg-green-100" 
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          )}
        >
          <Activity className="w-4 h-4 mr-2" />
          {realTimeTracking ? "Live Tracking ON" : "Enable Live Tracking"}
        </Button>

        {/* Map View Selector */}
        <div className="bg-white/95 backdrop-blur-lg border-2 border-slate-200 rounded-lg shadow-lg p-2">
          <div className="flex gap-1">
            <Button
              variant={useMapView === 'mappls' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('mappls')}
              className="text-xs h-8"
            >
              <Map className="w-3 h-3 mr-1" />
              Mappls
            </Button>
            <Button
              variant={useMapView === 'satellite' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('satellite')}
              className="text-xs h-8"
            >
              <Layers className="w-3 h-3 mr-1" />
              Satellite
            </Button>
            <Button
              variant={useMapView === 'hybrid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('hybrid')}
              className="text-xs h-8"
            >
              <Target className="w-3 h-3 mr-1" />
              OSM
            </Button>
          </div>
        </div>

        {/* Refresh Places */}
        <Button
          variant="secondary"
          size="sm"
          onClick={loadMapplsPlaces}
          className="bg-white/95 backdrop-blur-lg border-2 border-slate-200 shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Places
        </Button>
      </div>

      {/* Real-Time Location Panel */}
      {realTimeTracking && (
        <div className="absolute bottom-6 left-6 max-w-sm z-20">
          <RealTimeLocation
            userLocation={userLocation}
            onPlaceSelect={(place) => {
              console.log('Selected place from real-time:', place);
            }}
            onLocationVisit={(placeId, xpPoints) => {
              console.log(`Visited ${placeId}, earned ${xpPoints} XP`);
              onLocationVisit(placeId, xpPoints);
            }}
            isMoving={isMoving}
          />
        </div>
      )}

      {/* Places Info Panel */}
      <div className="absolute bottom-6 right-6 max-w-xs z-20">
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-orange-200 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Indore Real Places
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🍽️ Restaurants:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'RESTRNT').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">☕ Cafes:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'COFFEE').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🍺 Bars:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'BAR').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏨 Hotels:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'HOTEL').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏋️ Gyms:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'SPORTS').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">💅 Parlours:</span>
                <span className="font-bold">{mapplsPlaces.filter(p => p.categoryCode === 'BEAUTY').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <h2 className="text-3xl font-bold text-white mb-3">🎉 Real Place Discovered!</h2>
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Global type declarations
declare global {
  interface Window {
    mappls?: any;
  }
}
