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
  Gift,
  Target
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
  const [selectedPlace, setSelectedPlace] = useState<IndorePlace | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [userMoving, setUserMoving] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapProvider, setMapProvider] = useState<'mappls' | 'google' | 'osm'>('mappls');
  const [indorePlaces, setIndorePlaces] = useState<IndorePlace[]>([]);
  const [nearbySpots, setNearbySpots] = useState<IndorePlace[]>([]);

  // Load places data
  useEffect(() => {
    const places = clientPlacesService.getAllPlaces();
    setIndorePlaces(places);
    console.log(`✅ Loaded ${places.length} real Indore places`);
    
    const stats = clientPlacesService.getPlacesStats();
    console.log('📊 Places stats:', stats);
  }, []);

  // Initialize map without SDK dependencies
  const loadMap = useCallback(async () => {
    if (!mapRef.current) return;

    console.log('🗺️ Loading Real Indore Map...');
    setMapLoading(true);
    
    try {
      // Clear existing content
      mapRef.current.innerHTML = '';

      // Create map container
      const container = document.createElement('div');
      container.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      `;

      let mapFrame: HTMLIFrameElement;

      // Load different map providers
      if (mapProvider === 'mappls') {
        mapFrame = document.createElement('iframe');
        mapFrame.src = `https://maps.mappls.com/embed?lat=${INDORE_CENTER.lat}&lng=${INDORE_CENTER.lng}&zoom=13&layer=vector`;
        console.log('🗺️ Loading Mappls map...');
      } else if (mapProvider === 'google') {
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
          addRealPlaceMarkers();
          setMapLoading(false);
        }, 1000);
      };

      mapFrame.onerror = () => {
        console.log('⚠️ Map failed, using visual fallback...');
        createVisualMap();
      };

      container.appendChild(mapFrame);
      mapRef.current.appendChild(container);

    } catch (error) {
      console.error('❌ Map loading failed:', error);
      createVisualMap();
    }
  }, [mapProvider, indorePlaces]);

  // Visual fallback if all maps fail
  const createVisualMap = () => {
    if (!mapRef.current) return;

    console.log('🎨 Creating visual Indore map...');

    const visualMap = document.createElement('div');
    visualMap.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);
      position: relative;
      border-radius: 16px;
      overflow: hidden;
    `;

    visualMap.innerHTML = `
      <div style="
        position: absolute;
        inset: 0;
        background-image: 
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px),
          linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
        background-size: 60px 60px, 80px 80px, 100% 100%;
        animation: mapGlow 4s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        background: rgba(0,0,0,0.4);
        padding: 30px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255,255,255,0.3);
      ">
        🗺️ INDORE CITY EXPLORER<br>
        <span style="font-size: 16px; opacity: 0.9; display: block; margin-top: 8px;">
          Real Places • Real XP • Real Fun
        </span>
        <span style="font-size: 12px; opacity: 0.7; display: block; margin-top: 4px;">
          ${indorePlaces.length} Places Ready for Discovery
        </span>
      </div>
      <style>
        @keyframes mapGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      </style>
    `;

    mapRef.current.appendChild(visualMap);
    
    setTimeout(() => {
      addRealPlaceMarkers();
      setMapLoading(false);
    }, 500);
  };

  // Add real place markers
  const addRealPlaceMarkers = () => {
    if (!mapRef.current || indorePlaces.length === 0) return;

    console.log('📍 Adding real Indore place markers...');

    const markersContainer = document.createElement('div');
    markersContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 20;
    `;

    // Add markers for each real place
    indorePlaces.forEach((place, index) => {
      const marker = document.createElement('div');
      
      // Calculate position based on category and index
      let leftPos, topPos;
      
      if (place.category === 'restaurant') {
        leftPos = 20 + (index % 4) * 15;
        topPos = 25 + Math.floor(index / 4) * 20;
      } else if (place.category === 'cafe') {
        leftPos = 35 + (index % 3) * 20;
        topPos = 30 + Math.floor(index / 3) * 15;
      } else if (place.category === 'hotel') {
        leftPos = 55 + (index % 2) * 25;
        topPos = 25 + Math.floor(index / 2) * 25;
      } else if (place.category === 'bar') {
        leftPos = 65 + (index % 2) * 15;
        topPos = 45 + Math.floor(index / 2) * 20;
      } else if (place.category === 'gym') {
        leftPos = 25 + (index % 3) * 25;
        topPos = 55 + Math.floor(index / 3) * 15;
      } else if (place.category === 'parlour') {
        leftPos = 70 + (index % 2) * 15;
        topPos = 60 + Math.floor(index / 2) * 15;
      } else if (place.category === 'education') {
        leftPos = 15; // IIT Indore special position
        topPos = 80;
      } else if (place.category === 'shopping') {
        leftPos = 45 + (index % 2) * 30;
        topPos = 70 + Math.floor(index / 2) * 15;
      } else {
        leftPos = 40 + (index % 5) * 12;
        topPos = 40 + Math.floor(index / 5) * 12;
      }
      
      marker.style.cssText = `
        position: absolute;
        left: ${leftPos}%;
        top: ${topPos}%;
        width: ${place.famous ? '56px' : '44px'};
        height: ${place.famous ? '56px' : '44px'};
        background: ${place.famous 
          ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
          : getCategoryGradient(place.category)};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${place.famous ? '28px' : '22px'};
        box-shadow: 0 8px 25px ${place.famous ? 'rgba(245, 158, 11, 0.8)' : 'rgba(0,0,0,0.5)'};
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        border: ${place.famous ? '4px solid #FCD34D' : '3px solid white'};
        animation: ${place.famous ? 'bounce 2.5s infinite' : 'none'};
        z-index: ${place.famous ? '25' : '20'};
      `;
      
      // Category icons
      const icon = place.category === 'restaurant' ? '🍽️' : 
                   place.category === 'cafe' ? '☕' :
                   place.category === 'bar' ? '🍺' :
                   place.category === 'hotel' ? '🏨' :
                   place.category === 'gym' ? '🏋️' :
                   place.category === 'parlour' ? '💅' :
                   place.category === 'education' ? '🎓' :
                   place.category === 'shopping' ? '🛍️' : '📍';
      
      marker.innerHTML = icon;

      // Click handler
      marker.addEventListener('click', () => {
        console.log('🏪 Clicked place:', place.name);
        handlePlaceClick(place);
      });

      // Hover effects
      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
        marker.style.zIndex = '30';
        
        // Enhanced tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.95);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          white-space: nowrap;
          margin-bottom: 15px;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          border: 2px solid rgba(255,255,255,0.3);
        `;
        
        const distance = userCoords ? 
          (clientPlacesService.calculateDistance(userCoords, place.coordinates) * 1000).toFixed(0) : 
          'Unknown';
        
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px; color: ${place.famous ? '#FCD34D' : 'white'}; font-size: 16px;">
            ${place.famous ? '⭐ ' : ''}${place.name}${place.famous ? ' ⭐' : ''}
          </div>
          <div style="font-size: 12px; opacity: 0.9; margin-bottom: 6px;">
            📍 ${place.category.toUpperCase()} • ${distance}m away
          </div>
          <div style="color: gold; font-size: 13px; margin-bottom: 6px;">
            ⭐ ${place.rating} stars ${place.phone ? `• 📞 Available` : ''}
          </div>
          <div style="color: #4ADE80; font-size: 14px; font-weight: bold; margin-bottom: 6px;">
            🎯 Click for ${place.xp} XP!
          </div>
          ${place.openingHours ? `<div style="color: #93C5FD; font-size: 11px; margin-bottom: 4px;">🕒 ${place.openingHours}</div>` : ''}
          ${place.specialOffers?.[0] ? `<div style="color: #FBBF24; font-size: 11px;">💡 ${place.specialOffers[0]}</div>` : ''}
          ${place.famous ? '<div style="color: #FCD34D; font-size: 12px; margin-top: 6px; font-weight: bold;">🏆 FAMOUS INDORE LANDMARK!</div>' : ''}
        `;
        marker.appendChild(tooltip);
      });

      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        marker.style.zIndex = place.famous ? '25' : '20';
        const tooltip = marker.querySelector('div[style*="bottom: 100%"]');
        if (tooltip) tooltip.remove();
      });

      markersContainer.appendChild(marker);
    });

    // Add user location marker
    if (userCoords) {
      const userMarker = document.createElement('div');
      userMarker.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.9);
        transform: translate(-50%, -50%);
        z-index: 35;
        animation: pulse 2s infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      `;
      
      userMarker.innerHTML = '📍';
      
      // Movement ring
      if (userMoving) {
        const ring = document.createElement('div');
        ring.style.cssText = `
          position: absolute;
          top: -15px;
          left: -15px;
          width: 66px;
          height: 66px;
          border: 4px solid #10B981;
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        `;
        userMarker.appendChild(ring);
      }
      
      markersContainer.appendChild(userMarker);
    }

    mapRef.current.appendChild(markersContainer);

    // Add animations
    if (!document.getElementById('real-map-styles')) {
      const style = document.createElement('style');
      style.id = 'real-map-styles';
      style.textContent = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-12px); }
          60% { transform: translate(-50%, -50%) translateY(-6px); }
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    console.log(`✅ Added ${indorePlaces.length} place markers to map!`);
  };

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
    console.log('🏪 Place selected:', place.name);
    setSelectedPlace(place);
    
    // Check if already visited
    if (visitedLocations.includes(place.id)) {
      console.log('📍 Already visited this place');
      return;
    }
    
    // Check distance if user location available
    if (userCoords) {
      const distance = clientPlacesService.calculateDistance(userCoords, place.coordinates);
      if (distance > 0.1) { // More than 100m away
        console.log(`📏 Distance: ${(distance * 1000).toFixed(0)}m - allowing demo visit`);
      }
    }
    
    // Handle visit
    visitPlace(place);
  };

  // Visit place and award XP
  const visitPlace = (place: IndorePlace) => {
    console.log('🎉 Visiting place:', place.name);
    
    onLocationVisit(place.id, place.xp);
    
    setCurrentReward({
      location: place.name,
      points: place.xp,
      coupon: place.specialOffers?.[0] || `Special offer at ${place.name}`,
      badge: `${place.name} ${place.famous ? 'Legend' : 'Explorer'}`,
      famous: place.famous,
      category: place.category,
      rating: place.rating
    });
    
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 7000);
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && indorePlaces.length > 0) {
      loadMap();
    }
  }, [loadMap]);

  // Real-time location tracking
  useEffect(() => {
    let watchId: number | null = null;
    let previousCoords: [number, number] | null = null;

    if (liveTracking && navigator.geolocation) {
      console.log('📡 Starting live location tracking...');
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newCoords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          // Movement detection
          if (previousCoords) {
            const distance = clientPlacesService.calculateDistance(previousCoords, newCoords);
            setUserMoving(distance > 0.001); // Moving if > 1m
            
            if (distance > 0.01) { // Moved 10m+
              previousCoords = newCoords;
              console.log('🚶 User moved, updating nearby places...');
              
              // Update nearby places
              const nearby = clientPlacesService.getNearbyPlaces(newCoords, 3); // 3km radius
              setNearbySpots(nearby);
            }
          } else {
            previousCoords = newCoords;
            const nearby = clientPlacesService.getNearbyPlaces(newCoords, 3);
            setNearbySpots(nearby);
          }
          
          setUserCoords(newCoords);
          
          console.log('📍 Location:', {
            coords: newCoords,
            accuracy: position.coords.accuracy,
            nearby: nearbySpots.length,
            moving: userMoving
          });
        },
        (error) => {
          console.error('❌ Location error:', error);
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
        console.log('📡 Stopped tracking');
      }
    };
  }, [liveTracking, nearbySpots.length, userMoving]);

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-12 text-center shadow-2xl border-2 border-white max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-6 border-blue-500 border-t-transparent rounded-full mx-auto mb-8"
              />
              <h3 className="text-3xl font-bold text-slate-800 mb-4">🗺️ Loading Real Map</h3>
              <p className="text-lg text-slate-600 mb-4">Direct Integration • Zero Dependencies</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 mb-4">
                <div>🍽️ {placesStats.categories.restaurant || 0} Restaurants</div>
                <div>☕ {placesStats.categories.cafe || 0} Cafes</div>
                <div>🏨 {placesStats.categories.hotel || 0} Hotels</div>
                <div>🍺 {placesStats.categories.bar || 0} Bars</div>
                <div>🏋️ {placesStats.categories.gym || 0} Gyms</div>
                <div>💅 {placesStats.categories.parlour || 0} Parlours</div>
              </div>
              <p className="text-sm text-orange-600 font-bold">
                ⭐ {placesStats.famous} Famous Places • {placesStats.totalXP} Total XP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game Stats */}
      <div className="absolute top-6 left-6 space-y-4 z-40">
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
                    {currentLevel.name}
                  </Badge>
                  <span className="text-lg font-bold text-slate-800">{userPoints.toLocaleString()} XP</span>
                </div>
                <Progress 
                  value={(userPoints % 1000) / 10} 
                  className="w-32 h-2 bg-slate-200"
                />
                <p className="text-xs text-slate-600 mt-1">
                  {1000 - (userPoints % 1000)} XP to next level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 space-y-3 z-40">
        {/* Live Tracking */}
        <Button
          variant={liveTracking ? "default" : "secondary"}
          size="sm"
          onClick={() => setLiveTracking(!liveTracking)}
          className={cn(
            "bg-white/95 backdrop-blur-lg border-2 font-semibold shadow-lg transition-all",
            liveTracking 
              ? "border-green-400 text-green-700 bg-green-50" 
              : "border-slate-200 text-slate-700"
          )}
        >
          <Activity className="w-4 h-4 mr-2" />
          {liveTracking ? "Live ON" : "Enable Live"}
        </Button>

        {/* Map Selector */}
        <div className="bg-white/95 backdrop-blur-lg border-2 border-slate-200 rounded-lg shadow-lg p-2">
          <div className="text-xs text-slate-600 mb-2 text-center font-medium">Map</div>
          <div className="space-y-1">
            <Button
              variant={mapProvider === 'mappls' ? "default" : "ghost"}
              size="sm"
              onClick={() => setMapProvider('mappls')}
              className="text-xs h-7 w-full justify-start"
            >
              <Map className="w-3 h-3 mr-2" />
              Mappls
            </Button>
            <Button
              variant={mapProvider === 'google' ? "default" : "ghost"}
              size="sm"
              onClick={() => setMapProvider('google')}
              className="text-xs h-7 w-full justify-start"
            >
              <Layers className="w-3 h-3 mr-2" />
              Google
            </Button>
            <Button
              variant={mapProvider === 'osm' ? "default" : "ghost"}
              size="sm"
              onClick={() => setMapProvider('osm')}
              className="text-xs h-7 w-full justify-start"
            >
              <Target className="w-3 h-3 mr-2" />
              OSM
            </Button>
          </div>
        </div>
      </div>

      {/* Live Location Panel */}
      {liveTracking && (
        <div className="absolute bottom-6 left-6 max-w-sm z-40">
          <RealTimeLocation
            userLocation={userCoords}
            onPlaceSelect={(place) => {
              console.log('Selected from real-time:', place);
            }}
            onLocationVisit={(placeId, xpPoints) => {
              console.log(`Real-time visit: ${placeId}, ${xpPoints} XP`);
              onLocationVisit(placeId, xpPoints);
            }}
            isMoving={userMoving}
          />
        </div>
      )}

      {/* Places Stats Panel */}
      <div className="absolute bottom-6 right-6 max-w-xs z-40">
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-orange-200 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Real Indore Places
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span>🍽️ Restaurants:</span>
              <span className="font-bold text-red-600">{placesStats.categories.restaurant || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>☕ Cafes:</span>
              <span className="font-bold text-amber-600">{placesStats.categories.cafe || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>🏨 Hotels:</span>
              <span className="font-bold text-blue-600">{placesStats.categories.hotel || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>🍺 Bars:</span>
              <span className="font-bold text-purple-600">{placesStats.categories.bar || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>🏋️ Gyms:</span>
              <span className="font-bold text-red-500">{placesStats.categories.gym || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>💅 Parlours:</span>
              <span className="font-bold text-pink-600">{placesStats.categories.parlour || 0}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-orange-600">⭐ Famous:</span>
                <span className="text-orange-700">{placesStats.famous}</span>
              </div>
              <div className="text-xs text-center mt-2 p-2 bg-orange-50 rounded-lg">
                <div className="text-orange-800 font-bold">
                  {nearbySpots.length} places nearby
                </div>
                <div className="text-orange-600">
                  Avg: {placesStats.avgRating.toFixed(1)}⭐ • {placesStats.totalXP} XP total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Epic Reward Animation */}
      <AnimatePresence>
        {showRewardAnimation && currentReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: -100 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-60"
          >
            <Card className={cn(
              "border-4 max-w-2xl shadow-2xl",
              currentReward.famous 
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-yellow-200" 
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-blue-300"
            )}>
              <CardContent className="p-10 text-center">
                <motion.div
                  animate={{ 
                    rotate: currentReward.famous ? [0, 20, -20, 0] : 360,
                    scale: currentReward.famous ? [1, 1.5, 1] : [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: currentReward.famous ? 1.5 : 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={cn(
                    "rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl",
                    currentReward.famous 
                      ? "w-32 h-32 bg-yellow-200 border-4 border-yellow-400" 
                      : "w-28 h-28 bg-yellow-400 border-4 border-yellow-300"
                  )}
                >
                  {currentReward.famous ? 
                    <Star className="w-16 h-16 text-orange-700" /> :
                    <Gift className="w-14 h-14 text-purple-800" />
                  }
                </motion.div>
                
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className={cn(
                    "text-4xl font-bold mb-4",
                    currentReward.famous ? "text-yellow-100" : "text-white"
                  )}>
                    {currentReward.famous ? "🌟 FAMOUS PLACE CONQUERED!" : "🎉 Real Place Discovered!"}
                  </h2>
                  <p className={cn(
                    "text-2xl mb-8 font-bold",
                    currentReward.famous ? "text-yellow-200" : "text-yellow-300"
                  )}>
                    {currentReward.location}
                  </p>
                  
                  <div className="space-y-5 text-white">
                    <motion.div 
                      className={cn(
                        "flex items-center justify-center gap-4 rounded-xl p-6",
                        currentReward.famous ? "bg-yellow-300/40" : "bg-white/25"
                      )}
                      initial={{ x: -60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Star className="w-8 h-8 text-yellow-300" />
                      <span className="text-2xl font-bold">
                        +{currentReward.points} XP {currentReward.famous ? "🏆" : ""}
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-5"
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div className="text-lg font-semibold">
                        🎟️ {currentReward.coupon}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className={cn(
                        "rounded-xl p-5",
                        currentReward.famous 
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500" 
                          : "bg-gradient-to-r from-purple-400 to-pink-500"
                      )}
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <div className="text-lg font-semibold">
                        🏆 {currentReward.badge}
                      </div>
                    </motion.div>
                    
                    {currentReward.famous && (
                      <motion.div 
                        className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-xl p-4"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.3, type: "spring", damping: 8 }}
                      >
                        <div className="text-lg font-bold">
                          🎖️ LEGENDARY INDORE LANDMARK! 🎖️
                        </div>
                        <div className="text-sm opacity-90 mt-1">
                          You've discovered one of Indore's most famous spots!
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="bg-white/20 rounded-xl p-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      <div className="text-sm">
                        📍 {currentReward.category.toUpperCase()} • ⭐ {currentReward.rating} stars
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
