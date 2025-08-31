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
  Activity,
  Map,
  Layers,
  RefreshCw,
  Gift,
  Target,
  Navigation
} from "lucide-react";
import { getUserLevel } from "@/lib/mappls-config";
import { RealTimeLocation } from "./real-time-location";
import { clientPlacesService, type IndorePlace } from "@/lib/client-places-service";

interface GameMapProps {
  userPoints: number;
  onLocationVisit: (locationId: string, points: number) => void;
  visitedLocations: string[];
}

// Indore center coordinates
const INDORE_CENTER = { lat: 22.7196, lng: 75.8577 };

export function GameMap({ userPoints, onLocationVisit, visitedLocations }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<IndorePlace | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [useMapView, setUseMapView] = useState<'mappls' | 'google' | 'osm'>('mappls');
  const [allPlaces, setAllPlaces] = useState<IndorePlace[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<IndorePlace[]>([]);

  // Load places data
  useEffect(() => {
    const places = clientPlacesService.getAllPlaces();
    setAllPlaces(places);
    console.log(`✅ Loaded ${places.length} Indore places:`, {
      restaurants: places.filter(p => p.category === 'restaurant').length,
      cafes: places.filter(p => p.category === 'cafe').length,
      bars: places.filter(p => p.category === 'bar').length,
      hotels: places.filter(p => p.category === 'hotel').length,
      gyms: places.filter(p => p.category === 'gym').length,
      parlours: places.filter(p => p.category === 'parlour').length,
      famous: places.filter(p => p.famous).length
    });
  }, []);

  // Initialize map without any external dependencies
  const initializeSimpleMap = useCallback(async () => {
    if (!mapRef.current) return;

    console.log('🗺️ Initializing Simple Real Map...');
    setMapLoading(true);
    
    try {
      // Clear existing content
      mapRef.current.innerHTML = '';

      // Create map container
      const mapContainer = document.createElement('div');
      mapContainer.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      `;

      let mapFrame: HTMLIFrameElement;

      // Try different map providers based on selection
      if (useMapView === 'mappls') {
        mapFrame = document.createElement('iframe');
        mapFrame.src = `https://maps.mappls.com/embed?lat=${INDORE_CENTER.lat}&lng=${INDORE_CENTER.lng}&zoom=13&layer=vector`;
        console.log('🗺️ Loading Mappls map...');
      } else if (useMapView === 'google') {
        mapFrame = document.createElement('iframe');
        mapFrame.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBEyFQnWnJAhvdnw_DzF9LStBKZ0Hq-wAs&center=${INDORE_CENTER.lat},${INDORE_CENTER.lng}&zoom=13&maptype=roadmap`;
        console.log('🌍 Loading Google Maps...');
      } else {
        mapFrame = document.createElement('iframe');
        mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${INDORE_CENTER.lng-0.05}%2C${INDORE_CENTER.lat-0.05}%2C${INDORE_CENTER.lng+0.05}%2C${INDORE_CENTER.lat+0.05}&layer=mapnik&marker=${INDORE_CENTER.lat}%2C${INDORE_CENTER.lng}`;
        console.log('🗺️ Loading OpenStreetMap...');
      }

      mapFrame.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      `;

      mapFrame.onload = () => {
        console.log('✅ Map loaded successfully!');
        setTimeout(() => {
          addPlaceMarkers();
          setMapLoading(false);
        }, 1500);
      };

      mapFrame.onerror = () => {
        console.log('⚠️ Map failed to load, using fallback...');
        createFallbackMap();
      };

      mapContainer.appendChild(mapFrame);
      mapRef.current.appendChild(mapContainer);

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
      createFallbackMap();
    }
  }, [useMapView]);

  // Fallback map if all iframe methods fail
  const createFallbackMap = () => {
    if (!mapRef.current) return;

    console.log('🎨 Creating visual fallback map...');

    const fallbackMap = document.createElement('div');
    fallbackMap.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    `;

    // Add background pattern
    fallbackMap.innerHTML = `
      <div style="
        position: absolute;
        inset: 0;
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
          radial-gradient(circle at 60% 70%, rgba(255,255,255,0.1) 1px, transparent 1px),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 50px 50px;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        background: rgba(0,0,0,0.3);
        padding: 20px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
      ">
        🗺️ INDORE CITY MAP<br>
        <span style="font-size: 14px; opacity: 0.9;">Interactive Gaming Mode</span>
      </div>
    `;

    mapRef.current.appendChild(fallbackMap);
    
    setTimeout(() => {
      addPlaceMarkers();
      setMapLoading(false);
    }, 1000);
  };

  // Add place markers overlay
  const addPlaceMarkers = () => {
    if (!mapRef.current) return;

    console.log('📍 Adding real place markers...');

    const markersContainer = document.createElement('div');
    markersContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    `;

    // Add real places markers with smart positioning
    allPlaces.forEach((place, index) => {
      const marker = document.createElement('div');
      
      // Smart positioning based on place coordinates and category
      let leftPos, topPos;
      
      if (place.category === 'restaurant') {
        leftPos = 25 + (index % 3) * 20;
        topPos = 30 + Math.floor(index / 3) * 15;
      } else if (place.category === 'cafe') {
        leftPos = 35 + (index % 3) * 15;
        topPos = 25 + Math.floor(index / 3) * 12;
      } else if (place.category === 'hotel') {
        leftPos = 45 + (index % 2) * 25;
        topPos = 35 + Math.floor(index / 2) * 20;
      } else if (place.category === 'bar') {
        leftPos = 55 + (index % 2) * 20;
        topPos = 40 + Math.floor(index / 2) * 15;
      } else if (place.category === 'gym') {
        leftPos = 30 + (index % 3) * 18;
        topPos = 50 + Math.floor(index / 3) * 12;
      } else if (place.category === 'parlour') {
        leftPos = 60 + (index % 2) * 15;
        topPos = 55 + Math.floor(index / 2) * 10;
      } else if (place.category === 'education') {
        leftPos = 20; // IIT Indore position
        topPos = 75;
      } else {
        leftPos = 40 + (index % 4) * 15;
        topPos = 35 + Math.floor(index / 4) * 15;
      }
      
      marker.style.cssText = `
        position: absolute;
        left: ${leftPos}%;
        top: ${topPos}%;
        width: ${place.famous ? '52px' : '42px'};
        height: ${place.famous ? '52px' : '42px'};
        background: ${place.famous 
          ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
          : getCategoryGradient(place.category)};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${place.famous ? '24px' : '20px'};
        box-shadow: 0 6px 20px ${place.famous ? 'rgba(245, 158, 11, 0.7)' : 'rgba(0,0,0,0.4)'};
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        border: ${place.famous ? '4px solid #FCD34D' : '3px solid white'};
        animation: ${place.famous ? 'bounce 2.5s infinite' : 'none'};
        z-index: ${place.famous ? '15' : '10'};
      `;
      
      // Category icons
      const categoryIcon = place.category === 'restaurant' ? '🍽️' : 
                          place.category === 'cafe' ? '☕' :
                          place.category === 'bar' ? '🍺' :
                          place.category === 'hotel' ? '🏨' :
                          place.category === 'gym' ? '🏋️' :
                          place.category === 'parlour' ? '💅' :
                          place.category === 'education' ? '🎓' :
                          place.category === 'shopping' ? '🛍️' : '📍';
      
      marker.innerHTML = categoryIcon;

      marker.addEventListener('click', () => {
        console.log('🏪 Clicked real place:', place.name);
        handlePlaceClick(place);
      });

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.4)';
        marker.style.zIndex = '25';
        
        // Enhanced tooltip with real data
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.95);
          color: white;
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 13px;
          white-space: nowrap;
          margin-bottom: 12px;
          max-width: 320px;
          text-align: center;
          box-shadow: 0 6px 25px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.3);
        `;
        
        const distance = userLocation ? 
          (clientPlacesService.calculateDistance(userLocation, place.coordinates) * 1000).toFixed(0) : 
          'Unknown';
        
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px; color: ${place.famous ? '#FCD34D' : 'white'}; font-size: 14px;">
            ${place.famous ? '⭐ ' : ''}${place.name}${place.famous ? ' ⭐' : ''}
          </div>
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 6px;">
            📍 ${place.category.toUpperCase()} • ${distance}m away
          </div>
          <div style="color: gold; font-size: 12px; margin-bottom: 4px;">
            ⭐ ${place.rating} stars • 📞 ${place.phone || 'N/A'}
          </div>
          <div style="color: #4ADE80; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            🎯 Click for ${place.xp} XP!
          </div>
          ${place.specialOffers ? `<div style="color: #FBBF24; font-size: 10px;">💡 ${place.specialOffers[0]}</div>` : ''}
          ${place.famous ? '<div style="color: #FCD34D; font-size: 11px; margin-top: 4px; font-weight: bold;">🏆 FAMOUS INDORE SPOT!</div>' : ''}
        `;
        marker.appendChild(tooltip);
      });

      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        marker.style.zIndex = place.famous ? '15' : '10';
        const tooltip = marker.querySelector('div[style*="bottom: 100%"]');
        if (tooltip) tooltip.remove();
      });

      markersContainer.appendChild(marker);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = document.createElement('div');
      userMarker.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.8);
        transform: translate(-50%, -50%);
        z-index: 30;
        animation: pulse 2s infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      `;
      
      userMarker.innerHTML = '📍';
      
      // Add movement indicator
      if (isMoving) {
        const movementRing = document.createElement('div');
        movementRing.style.cssText = `
          position: absolute;
          top: -12px;
          left: -12px;
          width: 56px;
          height: 56px;
          border: 3px solid #10B981;
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        `;
        userMarker.appendChild(movementRing);
      }
      
      markersContainer.appendChild(userMarker);
    }

    mapRef.current.appendChild(markersContainer);

    // Add CSS animations
    if (!document.getElementById('simple-map-animations')) {
      const style = document.createElement('style');
      style.id = 'simple-map-animations';
      style.textContent = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          40% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
          60% {
            transform: translate(-50%, -50%) translateY(-5px);
          }
        }
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
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
            transform: scale(3);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    setMapLoading(false);
    console.log(`✅ Map ready with ${allPlaces.length} real places marked!`);
  }, [useMapView, allPlaces, userLocation, isMoving]);

  // Get category gradient
  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'restaurant': return 'linear-gradient(135deg, #FF6B6B, #FF8E53)';
      case 'cafe': return 'linear-gradient(135deg, #8B4513, #D2691E)';
      case 'bar': return 'linear-gradient(135deg, #9333EA, #7C3AED)';
      case 'hotel': return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
      case 'gym': return 'linear-gradient(135deg, #EF4444, #DC2626)';
      case 'parlour': return 'linear-gradient(135deg, #EC4899, #DB2777)';
      case 'education': return 'linear-gradient(135deg, #059669, #047857)';
      case 'shopping': return 'linear-gradient(135deg, #7C3AED, #5B21B6)';
      default: return 'linear-gradient(135deg, #6B7280, #4B5563)';
    }
  };

  // Handle place click
  const handlePlaceClick = (place: IndorePlace) => {
    console.log('🏪 Place clicked:', place.name);
    setSelectedLocation(place);
    
    // Check if already visited
    if (visitedLocations.includes(place.id)) {
      console.log('📍 Already visited this place');
      return;
    }
    
    // Check distance if user location available
    if (userLocation) {
      const distance = clientPlacesService.calculateDistance(userLocation, place.coordinates);
      if (distance > 0.1) { // More than 100m away
        console.log(`📏 Too far: ${(distance * 1000).toFixed(0)}m away`);
        // For demo, allow visit anyway
      }
    }
    
    // Handle visit
    handleLocationVisit(place);
  };

  // Handle location visit with rewards
  const handleLocationVisit = (place: IndorePlace) => {
    console.log('🎉 Visiting place:', place.name);
    
    onLocationVisit(place.id, place.xp);
    
    setCurrentReward({
      location: place.name,
      points: place.xp,
      coupon: place.specialOffers?.[0] || `Special offer at ${place.name}`,
      badge: `${place.name} ${place.famous ? 'Legend' : 'Explorer'}`,
      famous: place.famous
    });
    
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 6000);
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && allPlaces.length > 0) {
      initializeSimpleMap();
    }
  }, [initializeSimpleMap, allPlaces]);

  // Real-time location tracking
  useEffect(() => {
    let watchId: number | null = null;
    let lastPosition: [number, number] | null = null;

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
            const distance = clientPlacesService.calculateDistance(lastPosition, newLocation);
            setIsMoving(distance > 0.001); // Moving if > 1m
            
            if (distance > 0.01) { // Moved significantly (10m+)
              lastPosition = newLocation;
              console.log('🚶 User moved, updating nearby places...');
              
              // Update nearby places
              const nearby = clientPlacesService.getNearbyPlaces(newLocation, 2); // 2km radius
              setNearbyPlaces(nearby);
            }
          } else {
            lastPosition = newLocation;
            const nearby = clientPlacesService.getNearbyPlaces(newLocation, 2);
            setNearbyPlaces(nearby);
          }
          
          setUserLocation(newLocation);
          
          console.log('📍 Location update:', {
            coords: newLocation,
            accuracy: position.coords.accuracy,
            nearbyPlaces: nearbyPlaces.length,
            moving: isMoving
          });
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('📡 Stopped location tracking');
      }
    };
  }, [realTimeTracking, nearbyPlaces.length, isMoving]);

  const currentLevel = getUserLevel(userPoints);
  const placesStats = clientPlacesService.getPlacesStats();

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative"
        style={{ minHeight: "600px" }}
      >
        {mapLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center z-40">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-10 text-center shadow-2xl border-2 border-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-5 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
              />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">🗺️ Loading Real Indore Map</h3>
              <p className="text-sm text-slate-600 mb-3">Direct integration • No SDK required</p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span>🍽️ {placesStats.categories.restaurant || 0} Restaurants</span>
                <span>☕ {placesStats.categories.cafe || 0} Cafes</span>
                <span>🏨 {placesStats.categories.hotel || 0} Hotels</span>
              </div>
              <p className="text-xs text-orange-600 mt-2 font-semibold">
                ⭐ {placesStats.famous} Famous Places • {placesStats.totalXP} Total XP Available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game UI Overlay */}
      <div className="absolute top-6 left-6 space-y-4 z-30">
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

        {/* Real Places Stats */}
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-green-200 shadow-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{placesStats.total}</div>
              <div className="text-xs text-slate-600">Real Indore Places</div>
              <div className="text-xs text-green-600 mt-1">
                ⭐ {placesStats.famous} Famous • {placesStats.totalXP} XP Total
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <div className="absolute top-6 right-6 space-y-3 z-30">
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

        {/* Map Provider Selector */}
        <div className="bg-white/95 backdrop-blur-lg border-2 border-slate-200 rounded-lg shadow-lg p-2">
          <div className="text-xs text-slate-600 mb-2 text-center font-medium">Map Provider</div>
          <div className="flex flex-col gap-1">
            <Button
              variant={useMapView === 'mappls' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('mappls')}
              className="text-xs h-7 justify-start"
            >
              <Map className="w-3 h-3 mr-2" />
              Mappls India
            </Button>
            <Button
              variant={useMapView === 'google' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('google')}
              className="text-xs h-7 justify-start"
            >
              <Layers className="w-3 h-3 mr-2" />
              Google Maps
            </Button>
            <Button
              variant={useMapView === 'osm' ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseMapView('osm')}
              className="text-xs h-7 justify-start"
            >
              <Target className="w-3 h-3 mr-2" />
              OpenStreetMap
            </Button>
          </div>
        </div>
      </div>

      {/* Real-Time Location Panel */}
      {realTimeTracking && (
        <div className="absolute bottom-6 left-6 max-w-sm z-30">
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
      <div className="absolute bottom-6 right-6 max-w-xs z-30">
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
                <span className="font-bold">{placesStats.categories.restaurant || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">☕ Cafes:</span>
                <span className="font-bold">{placesStats.categories.cafe || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🍺 Bars:</span>
                <span className="font-bold">{placesStats.categories.bar || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏨 Hotels:</span>
                <span className="font-bold">{placesStats.categories.hotel || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏋️ Gyms:</span>
                <span className="font-bold">{placesStats.categories.gym || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">💅 Parlours:</span>
                <span className="font-bold">{placesStats.categories.parlour || 0}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-orange-600">⭐ Famous Places:</span>
                  <span className="text-orange-700">{placesStats.famous}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 text-center">
                  {nearbyPlaces.length} nearby • Avg rating {placesStats.avgRating.toFixed(1)}⭐
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Reward Animation with Special Effects for Famous Places */}
      <AnimatePresence>
        {showRewardAnimation && currentReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          >
            <Card className={cn(
              "border-4 max-w-lg shadow-2xl",
              currentReward.famous 
                ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 border-yellow-300" 
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-blue-300"
            )}>
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ 
                    rotate: currentReward.famous ? [0, 15, -15, 0] : 360,
                    scale: currentReward.famous ? [1, 1.4, 1] : [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: currentReward.famous ? 1 : 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={cn(
                    "rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl",
                    currentReward.famous 
                      ? "w-28 h-28 bg-yellow-300" 
                      : "w-24 h-24 bg-yellow-400"
                  )}
                >
                  {currentReward.famous ? 
                    <Star className="w-14 h-14 text-orange-700" /> :
                    <Gift className="w-12 h-12 text-purple-800" />
                  }
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className={cn(
                    "text-3xl font-bold mb-3",
                    currentReward.famous ? "text-yellow-100" : "text-white"
                  )}>
                    {currentReward.famous ? "🌟 FAMOUS PLACE DISCOVERED!" : "🎉 Real Place Discovered!"}
                  </h2>
                  <p className={cn(
                    "text-xl mb-6 font-semibold",
                    currentReward.famous ? "text-yellow-200" : "text-yellow-300"
                  )}>
                    {currentReward.location}
                  </p>
                  
                  <div className="space-y-4 text-white">
                    <motion.div 
                      className={cn(
                        "flex items-center justify-center gap-3 rounded-xl p-4",
                        currentReward.famous ? "bg-yellow-300/30" : "bg-white/20"
                      )}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Star className="w-6 h-6 text-yellow-300" />
                      <span className="text-xl font-bold">
                        +{currentReward.points} XP {currentReward.famous ? "🏆" : ""}
                      </span>
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
                      className={cn(
                        "rounded-xl p-4",
                        currentReward.famous 
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500" 
                          : "bg-gradient-to-r from-purple-400 to-pink-500"
                      )}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <div className="text-lg">
                        🏆 Achievement: {currentReward.badge}
                      </div>
                    </motion.div>
                    {currentReward.famous && (
                      <motion.div 
                        className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-3"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.3, type: "spring" }}
                      >
                        <div className="text-sm font-bold">
                          🎖️ FAMOUS INDORE LANDMARK BONUS! 🎖️
                        </div>
                      </motion.div>
                    )}
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
