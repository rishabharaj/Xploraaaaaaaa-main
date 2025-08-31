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
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load places data
  useEffect(() => {
    const places = clientPlacesService.getAllPlaces();
    setIndorePlaces(places);
    console.log(`✅ Loaded ${places.length} real Indore places`);
    
    const stats = clientPlacesService.getPlacesStats();
    console.log('📊 Places stats:', stats);
    
    // Start loading map after places are loaded
    setTimeout(() => {
      setMapLoaded(true);
      setMapLoading(false);
    }, 2000);
  }, []);

  // Handle place click
  const handlePlaceClick = (place: IndorePlace) => {
    console.log('🏪 Place selected:', place.name);
    setSelectedPlace(place);
    
    // Check if already visited
    if (visitedLocations.includes(place.id)) {
      console.log('📍 Already visited this place');
      return;
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

  // Get map iframe src
  const getMapSrc = () => {
    if (mapProvider === 'mappls') {
      return `https://maps.mappls.com/embed?lat=${INDORE_CENTER.lat}&lng=${INDORE_CENTER.lng}&zoom=13&layer=vector`;
    } else if (mapProvider === 'google') {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBEyFQnWnJAhvdnw_DzF9LStBKZ0Hq-wAs&center=${INDORE_CENTER.lat},${INDORE_CENTER.lng}&zoom=13&maptype=roadmap`;
    } else {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${INDORE_CENTER.lng-0.05}%2C${INDORE_CENTER.lat-0.05}%2C${INDORE_CENTER.lng+0.05}%2C${INDORE_CENTER.lat+0.05}&layer=mapnik&marker=${INDORE_CENTER.lat}%2C${INDORE_CENTER.lng}`;
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Map Container */}
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative" style={{ minHeight: "600px" }}>
        {mapLoading ? (
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
        ) : (
          <>
            {/* Map iframe */}
            <iframe
              key={mapProvider}
              src={getMapSrc()}
              className="w-full h-full border-none"
              style={{ minHeight: "600px" }}
              onLoad={() => console.log('✅ Map loaded successfully!')}
              onError={() => console.log('⚠️ Map failed to load')}
            />
            
            {/* Place markers overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {indorePlaces.map((place, index) => {
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

                const icon = place.category === 'restaurant' ? '🍽️' : 
                           place.category === 'cafe' ? '☕' :
                           place.category === 'bar' ? '🍺' :
                           place.category === 'hotel' ? '🏨' :
                           place.category === 'gym' ? '🏋️' :
                           place.category === 'parlour' ? '💅' :
                           place.category === 'education' ? '🎓' :
                           place.category === 'shopping' ? '🛍️' : '📍';

                return (
                  <div
                    key={place.id}
                    className="absolute cursor-pointer pointer-events-auto transition-all duration-300 hover:scale-150 hover:z-30"
                    style={{
                      left: `${leftPos}%`,
                      top: `${topPos}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: place.famous ? 25 : 20,
                    }}
                    onClick={() => handlePlaceClick(place)}
                    title={`${place.name} - ${place.xp} XP`}
                  >
                    <div
                      className={cn(
                        "rounded-full flex items-center justify-center font-bold shadow-2xl border-4",
                        place.famous 
                          ? "w-14 h-14 text-3xl border-yellow-300 animate-bounce" 
                          : "w-11 h-11 text-xl border-white"
                      )}
                      style={{
                        background: place.famous 
                          ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
                          : getCategoryGradient(place.category),
                        boxShadow: place.famous 
                          ? '0 8px 25px rgba(245, 158, 11, 0.8)' 
                          : '0 8px 25px rgba(0,0,0,0.5)',
                      }}
                    >
                      {icon}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-black/95 text-white p-4 rounded-lg text-sm whitespace-nowrap max-w-xs text-center">
                        <div className={cn("font-bold text-base mb-2", place.famous ? "text-yellow-300" : "text-white")}>
                          {place.famous ? '⭐ ' : ''}{place.name}{place.famous ? ' ⭐' : ''}
                        </div>
                        <div className="text-xs opacity-90 mb-1">
                          📍 {place.category.toUpperCase()}
                        </div>
                        <div className="text-yellow-300 text-xs mb-1">
                          ⭐ {place.rating} stars
                        </div>
                        <div className="text-green-400 font-bold">
                          🎯 Click for {place.xp} XP!
                        </div>
                        {place.famous && (
                          <div className="text-yellow-300 text-xs mt-1 font-bold">
                            🏆 FAMOUS LANDMARK!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* User location marker */}
              {userCoords && (
                <div
                  className="absolute z-30"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-green-600 border-4 border-white rounded-full flex items-center justify-center text-lg shadow-2xl animate-pulse">
                    📍
                  </div>
                  {userMoving && (
                    <div className="absolute top-0 left-0 w-9 h-9 border-4 border-green-500 rounded-full animate-ping" />
                  )}
                </div>
              )}
            </div>
          </>
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

      {/* CSS for hover effects */}
      <style jsx>{`
        .absolute div:hover .opacity-0 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
