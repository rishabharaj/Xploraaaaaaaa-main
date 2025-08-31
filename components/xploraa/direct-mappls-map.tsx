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
  Activity
} from "lucide-react";
import { 
  mapplsConfig, 
  indoreConfig, 
  gameLocations, 
  achievements,
  getUserLevel
} from "@/lib/mappls-config";
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
  steps: string[];
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
  const [realPlaces, setRealPlaces] = useState<RealPlace[]>([]);
  const [isMoving, setIsMoving] = useState(false);

  // Direct Mappls Map Integration using iframe/REST API approach
  const initializeDirectMappls = useCallback(async () => {
    if (!mapRef.current) return;

    console.log('🗺️ Initializing Direct Mappls Map...');
    
    try {
      // Clear any existing content
      mapRef.current.innerHTML = '';

      // Create iframe with direct Mappls embed
      const mapFrame = document.createElement('iframe');
      mapFrame.style.width = '100%';
      mapFrame.style.height = '100%';
      mapFrame.style.border = 'none';
      mapFrame.style.borderRadius = '16px';
      
      // Direct Mappls embed URL with Indore center
      const mapUrl = `https://maps.mappls.com/embed?` + new URLSearchParams({
        lat: indoreConfig.center[1].toString(),
        lng: indoreConfig.center[0].toString(),
        zoom: indoreConfig.zoom.toString(),
        layer: 'vector',
        fullscreen: 'true',
        overview: 'true',
        traffic: 'true'
      }).toString();

      mapFrame.src = mapUrl;
      
      // Add loading overlay
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
          z-index: 10;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          "></div>
          <div style="color: #333; font-weight: 600;">Loading Mappls Map...</div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;

      mapRef.current.appendChild(loadingDiv);
      mapRef.current.appendChild(mapFrame);

      // Remove loading after delay
      setTimeout(() => {
        if (loadingDiv.parentNode) {
          loadingDiv.remove();
        }
      }, 3000);

      // Add custom markers overlay
      addCustomMarkersOverlay();

      console.log('✅ Direct Mappls map loaded successfully!');
      
    } catch (error) {
      console.error('❌ Direct Mappls failed:', error);
      // Fallback to static map
      loadStaticMappls();
    }
  }, []);

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

    // Add game location markers
    gameLocations.forEach((location, index) => {
      const marker = document.createElement('div');
      marker.style.cssText = `
        position: absolute;
        left: ${50 + (Math.random() - 0.5) * 60}%;
        top: ${50 + (Math.random() - 0.5) * 60}%;
        width: 40px;
        height: 40px;
        background: #3B82F6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease;
        animation: bounce 2s infinite;
      `;
      
      marker.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 12px;">${location.rewards.points}</div>
          <div style="font-size: 8px;">XP</div>
        </div>
      `;

      marker.addEventListener('click', () => {
        setSelectedLocation(location);
        handleLocationClick(location);
      });

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.1)';
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 5px;
        `;
        tooltip.textContent = location.name;
        marker.appendChild(tooltip);
      });

      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
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
        width: 20px;
        height: 20px;
        background: #10B981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        transform: translate(-50%, -50%);
        z-index: 10;
        animation: pulse 2s infinite;
      `;
      markersContainer.appendChild(userMarker);
    }

    mapRef.current.appendChild(markersContainer);

    // Add custom CSS for animations
    const style = document.createElement('style');
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
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 0.7;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  };

  // Fallback to static Mappls map
  const loadStaticMappls = () => {
    if (!mapRef.current) return;

    console.log('📸 Loading static Mappls map...');
    
    // Create static map using Mappls Static API
    const staticMapUrl = `https://apis.mappls.com/advancedmaps/v1/${mapplsConfig.mapApiKey}/still_image_polyline?` +
      new URLSearchParams({
        center: `${indoreConfig.center[1]},${indoreConfig.center[0]}`,
        zoom: indoreConfig.zoom.toString(),
        size: '800x600',
        ssf: '1',
        markers: gameLocations.map(loc => `${loc.coordinates[1]},${loc.coordinates[0]}`).join('|')
      }).toString();

    const staticMapImg = document.createElement('img');
    staticMapImg.src = staticMapUrl;
    staticMapImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    `;
    
    staticMapImg.onerror = () => {
      // Final fallback to OpenStreetMap
      console.log('🌍 Using OpenStreetMap fallback...');
      loadOpenStreetMapFallback();
    };

    mapRef.current.appendChild(staticMapImg);
    addCustomMarkersOverlay();
  };

  // Final fallback to OpenStreetMap
  const loadOpenStreetMapFallback = () => {
    if (!mapRef.current) return;

    mapRef.current.innerHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        scrolling="no" 
        marginheight="0" 
        marginwidth="0" 
        src="https://www.openstreetmap.org/export/embed.html?bbox=${indoreConfig.center[0]-0.1}%2C${indoreConfig.center[1]-0.1}%2C${indoreConfig.center[0]+0.1}%2C${indoreConfig.center[1]+0.1}&amp;layer=mapnik&amp;marker=${indoreConfig.center[1]}%2C${indoreConfig.center[0]}"
        style="border-radius: 16px;"
      ></iframe>
    `;
    
    setTimeout(() => {
      addCustomMarkersOverlay();
    }, 1000);

    console.log('🗺️ OpenStreetMap fallback loaded');
  };

  // Handle location click
  const handleLocationClick = (location: any) => {
    console.log('📍 Location clicked:', location.name);
    
    if (!visitedLocations.includes(location.id)) {
      // Simulate visit if close enough
      if (userLocation) {
        const distance = calculateDistance(userLocation, location.coordinates);
        if (distance <= 0.1) { // Within 100m
          handleLocationVisit(location);
        }
      } else {
        // For demo, allow clicking to visit
        handleLocationVisit(location);
      }
    }
  };

  // Handle location visit
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

  // Initialize map on component mount
  useEffect(() => {
    if (mapRef.current) {
      initializeDirectMappls();
    }
  }, [initializeDirectMappls]);

  // Real-time location tracking
  useEffect(() => {
    let watchId: number | null = null;

    if (realTimeTracking && navigator.geolocation) {
      console.log('📡 Starting real-time location tracking...');
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          
          setUserLocation(newLocation);
          setIsMoving(position.coords.speed ? position.coords.speed > 0.5 : false);
          
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
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('📡 Stopped location tracking');
      }
    };
  }, [realTimeTracking]);

  // Load real places data
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

  const currentLevel = getUserLevel(userPoints);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative"
        style={{ minHeight: "600px" }}
      />

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
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 space-y-3 z-20">
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
      </div>

      {/* Real-Time Location Panel */}
      {realTimeTracking && (
        <div className="absolute bottom-6 left-6 max-w-sm z-20">
          <RealTimeLocation
            userLocation={userLocation}
            onPlaceSelect={(place) => {
              console.log('Selected place:', place);
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
