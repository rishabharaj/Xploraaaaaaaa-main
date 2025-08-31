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
  Navigation,
  Route,
  Target,
  Activity,
  Gift,
  Clock
} from "lucide-react";
import { gameLocations, getUserLevel } from "@/lib/mappls-config";

interface DemoMapProps {
  userPoints: number;
  onLocationVisit: (locationId: string, points: number) => void;
  visitedLocations: string[];
}

export function DemoMap({ userPoints, onLocationVisit, visitedLocations }: DemoMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLocation] = useState<[number, number]>([75.8577, 22.7196]); // Indore center
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [mapMode, setMapMode] = useState<"2D" | "3D">("2D");

  const currentLevel = getUserLevel(userPoints);

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    
    if (!visitedLocations.includes(location.id)) {
      // Simulate navigation route
      setCurrentRoute({
        distance: "0.8 km",
        duration: "12 min",
        instructions: [
          "Head south on Main Street",
          "Turn right onto Mall Road",
          "Destination will be on your left"
        ]
      });
      
      // Auto-visit after a short delay (demo purposes)
      setTimeout(() => {
        handleLocationVisit(location);
      }, 2000);
    }
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
    
    setTimeout(() => {
      setShowRewardAnimation(false);
      setCurrentRoute(null);
    }, 4000);
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

  const nearbyLocations = gameLocations.slice(0, 3).map(loc => ({
    ...loc,
    distance: Math.random() * 2
  }));

  return (
    <div className="relative w-full h-full bg-slate-100">
      {/* Interactive Demo Map */}
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white relative bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600">
        {/* Map Background with Indore Streets Simulation */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100">
            {/* Simulated Street Grid */}
            <svg className="w-full h-full" viewBox="0 0 800 600">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Major Roads */}
              <path d="M0 200 L800 200" stroke="#cbd5e1" strokeWidth="8" opacity="0.8"/>
              <path d="M0 400 L800 400" stroke="#cbd5e1" strokeWidth="8" opacity="0.8"/>
              <path d="M200 0 L200 600" stroke="#cbd5e1" strokeWidth="8" opacity="0.8"/>
              <path d="M400 0 L400 600" stroke="#cbd5e1" strokeWidth="6" opacity="0.6"/>
              <path d="M600 0 L600 600" stroke="#cbd5e1" strokeWidth="6" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Location Markers */}
        {gameLocations.map((location, index) => {
          const isVisited = visitedLocations.includes(location.id);
          const x = 150 + (index * 120);
          const y = 200 + (index % 2) * 150;
          
          return (
            <motion.div
              key={location.id}
              className="absolute cursor-pointer"
              style={{ 
                left: `${x}px`, 
                top: `${y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleLocationClick(location)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Pulsing Ring */}
              <motion.div
                className={cn(
                  "absolute inset-0 w-16 h-16 rounded-full",
                  isVisited 
                    ? "bg-emerald-400/30 border-2 border-emerald-500" 
                    : "bg-red-400/30 border-2 border-red-500"
                )}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Main Marker */}
              <div className={cn(
                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all",
                isVisited 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white text-gray-800 hover:bg-red-50"
              )}>
                {getLocationEmoji(location.type)}
              </div>
              
              {/* Points Badge */}
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                +{location.rewards.points}
              </div>
              
              {/* Location Name */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-800 whitespace-nowrap shadow-md">
                {location.name}
              </div>
            </motion.div>
          );
        })}

        {/* User Location */}
        <div 
          className="absolute"
          style={{ 
            left: '400px', 
            top: '300px',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <motion.div
            className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
            You are here
          </div>
        </div>

        {/* Route Line (when navigating) */}
        {currentRoute && selectedLocation && (
          <motion.svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <motion.path
              d="M400 300 Q450 250 550 350"
              stroke="#3B82F6"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2 }}
            />
          </motion.svg>
        )}
      </div>

      {/* Enhanced Game UI Overlay */}
      <div className="absolute top-6 left-6 space-y-4">
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

        {/* Map Controls */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMapMode(mapMode === "2D" ? "3D" : "2D")}
            className="bg-white/95 backdrop-blur-lg border-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold shadow-lg"
          >
            {mapMode === "2D" ? "🌍 Switch to 3D" : "🗺️ Switch to 2D"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRealTimeTracking(!realTimeTracking)}
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
        </div>
      </div>

      {/* Navigation Panel */}
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
              
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Turn-by-Turn Directions:
                </h4>
                {currentRoute.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="text-xs text-slate-700 p-2 bg-slate-50 rounded-lg">
                    <span className="font-bold text-blue-600">{index + 1}.</span> {instruction}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Nearby Locations Panel */}
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
                onClick={() => handleLocationClick(location)}
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

      {/* Live Location Status */}
      {realTimeTracking && (
        <div className="absolute bottom-6 right-6">
          <Card className="bg-white/95 backdrop-blur-lg border-2 border-indigo-200 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-sm font-semibold text-indigo-800">Live Location Active</div>
                  <div className="text-xs text-slate-600">
                    📍 22.7196°N, 75.8577°E (Indore, MP)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    Keep exploring Indore to unlock more rewards! 🚀
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
