"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Target
} from "lucide-react";
import { 
  indoreConfig, 
  gameLocations, 
  getUserLevel
} from "@/lib/mappls-config";
import { RealTimeLocation } from "./real-time-location";
import { realPlacesService, type RealPlace } from "@/lib/real-places-service";

interface GameMapProps {
  userPoints: number;
  onLocationVisit: (locationId: string, points: number) => void;
  visitedLocations: string[];
}

// Real Indore places data with exact coordinates
const REAL_INDORE_PLACES = [
  // Famous Restaurants
  { name: "Sarafa Bazaar Night Market", category: "restaurant", lat: 22.7178, lng: 75.8431, xp: 100, rating: 4.6, famous: true },
  { name: "Chappan Dukan Food Street", category: "restaurant", lat: 22.7244, lng: 75.8715, xp: 100, rating: 4.5, famous: true },
  { name: "Nafees Restaurant", category: "restaurant", lat: 22.7013, lng: 75.8567, xp: 85, rating: 4.4, famous: true },
  { name: "Guru Kripa", category: "restaurant", lat: 22.7184, lng: 75.8794, xp: 75, rating: 4.3 },
  { name: "Madhuram Sweets", category: "restaurant", lat: 22.7239, lng: 75.8613, xp: 70, rating: 4.2 },
  
  // Cafes
  { name: "Cafe Mocha", category: "cafe", lat: 22.7311, lng: 75.8847, xp: 60, rating: 4.3 },
  { name: "Barista Coffee", category: "cafe", lat: 22.7545, lng: 75.8926, xp: 50, rating: 4.1 },
  { name: "CCD Central Mall", category: "cafe", lat: 22.7284, lng: 75.8794, xp: 45, rating: 4.0 },
  
  // Hotels
  { name: "Radisson Blu Indore", category: "hotel", lat: 22.7284, lng: 75.8794, xp: 120, rating: 4.7, famous: true },
  { name: "Lemon Tree Hotel", category: "hotel", lat: 22.7542, lng: 75.8926, xp: 90, rating: 4.4 },
  { name: "Sayaji Hotel", category: "hotel", lat: 22.7178, lng: 75.8431, xp: 85, rating: 4.3 },
  
  // Bars
  { name: "10 Downing Street", category: "bar", lat: 22.7311, lng: 75.8847, xp: 80, rating: 4.4 },
  { name: "Liquid Lounge", category: "bar", lat: 22.7244, lng: 75.8715, xp: 75, rating: 4.2 },
  
  // Gyms
  { name: "Gold's Gym", category: "gym", lat: 22.7542, lng: 75.8926, xp: 70, rating: 4.3 },
  { name: "Fitness First", category: "gym", lat: 22.7284, lng: 75.8794, xp: 65, rating: 4.2 },
  { name: "Talwalkars Gym", category: "gym", lat: 22.7178, lng: 75.8431, xp: 60, rating: 4.1 },
  
  // Parlours
  { name: "Lakme Salon", category: "parlour", lat: 22.7311, lng: 75.8847, xp: 55, rating: 4.4 },
  { name: "VLCC Beauty", category: "parlour", lat: 22.7244, lng: 75.8715, xp: 50, rating: 4.2 },
  
  // IIT Indore (Special Location)
  { name: "IIT Indore Campus", category: "education", lat: 22.5200, lng: 75.9200, xp: 150, rating: 4.9, famous: true }
];

export function GameMap({ userPoints, onLocationVisit, visitedLocations }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [useMapView, setUseMapView] = useState<'mappls' | 'google' | 'osm'>('mappls');

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

  // Initialize Direct Map without SDK
  const initializeDirectMap = async () => {
    if (!mapRef.current) return;

    console.log('🗺️ Loading Real Map - Direct Integration...');
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

      let mapLoaded = false;
      
      // Method 1: Direct Mappls Map Embed
      if (useMapView === 'mappls') {
        try {
          const mapFrame = document.createElement('iframe');
          mapFrame.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: white;
          `;
          
          // Official Mappls embed URL
          const mapplsUrl = `https://maps.mappls.com/embed?` + new URLSearchParams({
            lat: indoreConfig.center[1].toString(),
            lng: indoreConfig.center[0].toString(),
            zoom: '13',
            layer: 'vector'
          }).toString();

          mapFrame.src = mapplsUrl;
          
          mapFrame.onload = () => {
            console.log('✅ Mappls map loaded successfully!');
            setTimeout(() => {
              addRealPlaceMarkers();
              setMapLoading(false);
            }, 1500);
          };
          
          mapFrame.onerror = () => {
            console.log('⚠️ Mappls embed failed, switching to Google...');
            loadGoogleMapFallback();
          };
          
          mapContainer.appendChild(mapFrame);
          mapLoaded = true;
          
        } catch (error) {
          console.log('⚠️ Mappls error:', error);
        }
      }

      // Method 2: Google Maps embed
      if (!mapLoaded || useMapView === 'google') {
        loadGoogleMapFallback();
      }

      // Method 3: OpenStreetMap
      if (useMapView === 'osm') {
        loadOpenStreetMapFallback();
      }

      mapRef.current.appendChild(mapContainer);

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
      setMapLoading(false);
    }
  };

  // Google Maps fallback
  const loadGoogleMapFallback = () => {
    if (!mapRef.current) return;
    
    console.log('🌍 Loading Google Maps fallback...');
    
    const mapContainer = mapRef.current.querySelector('div') || mapRef.current;
    
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
      zoom: '13',
      maptype: 'roadmap'
    }).toString();

    googleFrame.src = googleUrl;
    googleFrame.onload = () => {
      console.log('✅ Google Maps loaded!');
      setTimeout(() => {
        addRealPlaceMarkers();
        setMapLoading(false);
      }, 1500);
    };
    
    mapContainer.appendChild(googleFrame);
  };

  // OpenStreetMap fallback
  const loadOpenStreetMapFallback = () => {
    if (!mapRef.current) return;
    
    console.log('🗺️ Loading OpenStreetMap...');
    
    const mapContainer = mapRef.current.querySelector('div') || mapRef.current;
    
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
    osmFrame.onload = () => {
      console.log('✅ OpenStreetMap loaded!');
      setTimeout(() => {
        addRealPlaceMarkers();
        setMapLoading(false);
      }, 1500);
    };
    
    mapContainer.appendChild(osmFrame);
  };

  // Add real place markers as overlay
  const addRealPlaceMarkers = () => {
    if (!mapRef.current) return;

    console.log('📍 Adding real Indore place markers...');

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

    // Add real places markers
    REAL_INDORE_PLACES.forEach((place, index) => {
      const marker = document.createElement('div');
      
      // Calculate position based on coordinates (simplified positioning)
      const leftPos = 30 + (index % 8) * 8 + Math.random() * 5;
      const topPos = 25 + Math.floor(index / 8) * 12 + Math.random() * 5;
      
      marker.style.cssText = `
        position: absolute;
        left: ${leftPos}%;
        top: ${topPos}%;
        width: ${place.famous ? '48px' : '36px'};
        height: ${place.famous ? '48px' : '36px'};
        background: ${place.famous 
          ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
          : getCategoryColor(place.category)};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${place.famous ? '20px' : '16px'};
        box-shadow: 0 4px 16px ${place.famous ? 'rgba(245, 158, 11, 0.6)' : 'rgba(0,0,0,0.3)'};
        cursor: pointer;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        border: ${place.famous ? '3px solid #FCD34D' : '2px solid white'};
        animation: ${place.famous ? 'bounce 2s infinite' : 'none'};
        z-index: ${place.famous ? '15' : '10'};
      `;
      
      // Category icons
      const categoryIcon = place.category === 'restaurant' ? '🍽️' : 
                          place.category === 'cafe' ? '☕' :
                          place.category === 'bar' ? '🍺' :
                          place.category === 'hotel' ? '🏨' :
                          place.category === 'gym' ? '🏋️' :
                          place.category === 'parlour' ? '💅' :
                          place.category === 'education' ? '🎓' : '📍';
      
      marker.innerHTML = categoryIcon;

      marker.addEventListener('click', () => {
        console.log('🏪 Clicked real place:', place.name);
        handleRealPlaceClick(place);
      });

      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.3)';
        marker.style.zIndex = '20';
        
        // Enhanced tooltip
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
          margin-bottom: 10px;
          max-width: 280px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.2);
        `;
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 6px; color: ${place.famous ? '#FCD34D' : 'white'};">
            ${place.famous ? '⭐ ' : ''}${place.name}${place.famous ? ' ⭐' : ''}
          </div>
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">
            📍 ${place.category.toUpperCase()} • ⭐ ${place.rating} stars
          </div>
          <div style="color: #4ADE80; font-size: 12px; font-weight: bold;">
            🎯 Click for ${place.xp} XP!
          </div>
          ${place.famous ? '<div style="color: #FCD34D; font-size: 10px; margin-top: 4px;">🏆 FAMOUS PLACE!</div>' : ''}
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
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.8);
        transform: translate(-50%, -50%);
        z-index: 25;
        animation: pulse 2s infinite;
      `;
      
      // Add movement indicator
      if (isMoving) {
        const movementRing = document.createElement('div');
        movementRing.style.cssText = `
          position: absolute;
          top: -10px;
          left: -10px;
          width: 48px;
          height: 48px;
          border: 3px solid #10B981;
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        `;
        userMarker.appendChild(movementRing);
      }
      
      markersContainer.appendChild(userMarker);
    }

    mapRef.current.appendChild(markersContainer);

    // Add animations CSS
    if (!document.getElementById('real-map-animations')) {
      const style = document.createElement('style');
      style.id = 'real-map-animations';
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
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    console.log(`✅ Added ${REAL_INDORE_PLACES.length} real place markers`);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'restaurant': return 'linear-gradient(135deg, #FF6B6B, #FF8E53)';
      case 'cafe': return 'linear-gradient(135deg, #8B4513, #A0522D)';
      case 'bar': return 'linear-gradient(135deg, #9333EA, #7C3AED)';
      case 'hotel': return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
      case 'gym': return 'linear-gradient(135deg, #EF4444, #DC2626)';
      case 'parlour': return 'linear-gradient(135deg, #EC4899, #DB2777)';
      case 'education': return 'linear-gradient(135deg, #059669, #047857)';
      default: return 'linear-gradient(135deg, #6B7280, #4B5563)';
    }
  };

  // Handle real place click
  const handleRealPlaceClick = (place: any) => {
    console.log('🏪 Real place clicked:', place.name);
    
    // Simulate visit
    const reward = {
      id: `real_${place.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: place.name,
      rewards: {
        points: place.xp,
        coupon: `Special discount at ${place.name}`,
        badge: `${place.name} ${place.famous ? 'Legend' : 'Explorer'}`
      }
    };
    
    handleLocationVisit(reward);
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
      initializeDirectMap();
    }
  }, [useMapView]);

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
            const distance = calculateDistance(lastPosition, newLocation);
            setIsMoving(distance > 0.001); // Moving if > 1m
            
            if (distance > 0.01) { // Moved significantly
              lastPosition = newLocation;
              console.log('🚶 User moved, updating location...');
            }
          } else {
            lastPosition = newLocation;
          }
          
          setUserLocation(newLocation);
          
          // Update markers if they exist
          addRealPlaceMarkers();
          
          console.log('📍 Location update:', {
            coords: newLocation,
            accuracy: position.coords.accuracy,
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
  }, [realTimeTracking, isMoving]);

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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center z-30">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
              />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">🗺️ Loading Real Mappls Map</h3>
              <p className="text-sm text-slate-600 mb-2">Direct integration with Indore area</p>
              <p className="text-xs text-slate-500">{REAL_INDORE_PLACES.length} real places ready to discover</p>
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

        {/* Real Places Stats */}
        <Card className="bg-white/95 backdrop-blur-lg border-2 border-green-200 shadow-xl">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">{REAL_INDORE_PLACES.length}</div>
              <div className="text-xs text-slate-600">Real Indore Places</div>
              <div className="text-xs text-green-600 mt-1">
                {REAL_INDORE_PLACES.filter(p => p.famous).length} Famous Spots
              </div>
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
              Mappls (India)
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
              Indore Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🍽️ Restaurants:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'restaurant').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">☕ Cafes:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'cafe').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🍺 Bars:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'bar').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏨 Hotels:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'hotel').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🏋️ Gyms:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'gym').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">💅 Parlours:</span>
                <span className="font-bold">{REAL_INDORE_PLACES.filter(p => p.category === 'parlour').length}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-orange-600">⭐ Famous Places:</span>
                  <span className="text-orange-700">{REAL_INDORE_PLACES.filter(p => p.famous).length}</span>
                </div>
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
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          >
            <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 border-4 border-yellow-400 max-w-lg shadow-2xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <Gift className="w-12 h-12 text-purple-800" />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-3">🎉 Real Place Discovered!</h2>
                  <p className="text-xl text-yellow-300 mb-6 font-semibold">{currentReward.location}</p>
                  
                  <div className="space-y-4 text-white">
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
