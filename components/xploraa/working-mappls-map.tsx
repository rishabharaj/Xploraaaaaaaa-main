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
  Target,
  Zap,
  Navigation,
  Clock,
  Coffee,
  Camera,
  ShoppingBag
} from "lucide-react";
import { getUserLevel } from "@/lib/mappls-config";
import { RealTimeLocation } from "./real-time-location";
import { clientPlacesService, type IndorePlace } from "@/lib/client-places-service";

interface GameMapProps {
  userPoints: number;
  onLocationVisit: (locationId: string, points: number) => void;
  visitedLocations: string[];
}

// Delhi center coordinates for Mappls
const DELHI_CENTER = { lat: 28.638698386592438, lng: 77.27604556863412 };

declare global {
  interface Window {
    mappls: any;
    initMap1: () => void;
  }
}

export function GameMap({ userPoints, onLocationVisit, visitedLocations }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<IndorePlace | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [userMoving, setUserMoving] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [indorePlaces, setIndorePlaces] = useState<IndorePlace[]>([]);
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Load places data
  useEffect(() => {
    const places = clientPlacesService.getAllPlaces();
    try {
      // Clear any existing content
      mapRef.current.innerHTML = '';

      // Wait for browser geolocation to create the map centered on user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;

          // Create the map using Mappls SDK centered on user
          const map = new window.mappls.Map(mapRef.current, {
            center: [userLng, userLat],
            zoom: 16,
            zoomControl: true,
            clickableIcons: true,
            backgroundColor: '#f8fafc',
            traffic: true,
            fullscreenControl: true,
            scrollZoom: true,
            dragPan: true,
            keyboard: true
          });

          setMapInstance(map);
          setMapLoading(false);
          setMapError(null);

          console.log('✅ Mappls map initialized at user location');

          // Add event listeners
          map.on('load', () => addPlaceMarkers(map));
          map.on('click', (e: any) => console.log('🖱️ Map clicked at:', e.lngLat));
        }, (err) => {
          console.warn('⚠️ Geolocation failed, falling back to DELHI_CENTER', err);

          // fallback: create map at DELHI_CENTER if geolocation fails
          const map = new window.mappls.Map(mapRef.current, {
            center: [DELHI_CENTER.lng, DELHI_CENTER.lat],
            zoom: 12,
            zoomControl: true,
            clickableIcons: true,
            backgroundColor: '#f8fafc',
            traffic: true,
            fullscreenControl: true,
            scrollZoom: true,
            dragPan: true,
            keyboard: true
          });

          setMapInstance(map);
          setMapLoading(false);
          setMapError(null);

          map.on('load', () => addPlaceMarkers(map));
        }, { enableHighAccuracy: true, timeout: 15000 });
      } else {
        // If geolocation not supported, fallback to DELHI_CENTER
        const map = new window.mappls.Map(mapRef.current, {
          center: [DELHI_CENTER.lng, DELHI_CENTER.lat],
          zoom: 12,
          zoomControl: true
        });
        setMapInstance(map);
        setMapLoading(false);
        setMapError(null);
      }
          // Add user marker
          const userMarker = new window.mappls.Marker({
            map: map,
            position: { lat: userLat, lng: userLng },
            fitbounds: true,
            icon_url: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=99ccff|15&=',
            width: 35,
            height: 35
          });
          
          console.log('📍 User location added to map');
        });
      }

    } catch (error) {
      console.error('❌ Mappls map initialization failed:', error);
      setMapError(`Map initialization failed: ${error}`);
      setMapLoading(false);
    }
  }, []);

  // Add place markers to the map
  const addPlaceMarkers = (map: any) => {
    indorePlaces.forEach((place, index) => {
      try {
        // Calculate marker position (simulate real coordinates around Indore)
        const offsetLat = (Math.random() - 0.5) * 0.02; // ~1km radius
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        const markerLat = DELHI_CENTER.lat + offsetLat;
        const markerLng = DELHI_CENTER.lng + offsetLng;

        // Create custom marker
        const marker = new window.mappls.Marker({
          map: map,
          position: { lat: markerLat, lng: markerLng },
          fitbounds: false,
          icon_url: getMarkerIcon(place.category),
          width: 40,
          height: 40,
          offset: [0, -20]
        });

        // Add click event
        marker.on('click', () => {
          handlePlaceClick(place);
        });

        // Add info window
        const infoWindow = new window.mappls.InfoWindow({
          map: map,
          position: { lat: markerLat, lng: markerLng },
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">${place.name}</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${place.category}</p>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                <span style="color: #f59e0b;">⭐</span>
                <span style="color: #374151; font-size: 14px;">${place.rating}</span>
              </div>
              <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 6px 12px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 14px;">
                ${place.xp} XP • Click to Visit
              </div>
            </div>
          `
        });

        marker.infoWindow = infoWindow;

      } catch (error) {
        console.error(`❌ Failed to add marker for ${place.name}:`, error);
      }
    });
  };

  // Get marker icon based on category
  const getMarkerIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      restaurant: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=ff6b6b|15&=',
      cafe: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=4ecdc4|15&=',
      hotel: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=45b7d1|15&=',
      bar: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=f39c12|15&=',
      gym: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=e74c3c|15&=',
      parlour: 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=9b59b6|15&='
    };
    return iconMap[category] || 'https://apis.mapmyindia.com/map_v3/1.3/png?marker=3498db|15&=';
  };

  // Load Mappls script
  useEffect(() => {
    const loadMapplsScript = () => {
      // Check if script is already loaded
      if (window.mappls) {
        console.log('✅ Mappls SDK already loaded');
        setMapScriptLoaded(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://apis.mappls.com/advancedmaps/api/b8a5269c-04a7-42cf-8501-3b1371f1ed73/map_sdk?layer=vector&v=3.0&callback=initMap1';
      script.defer = true;
      script.async = true;

      // Define the callback function
      window.initMap1 = () => {
        console.log('✅ Mappls SDK loaded successfully');
        setMapScriptLoaded(true);
      };

      script.onload = () => {
        console.log('📦 Mappls script element loaded');
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Mappls script:', error);
        setMapError('Failed to load Mappls SDK');
        setMapLoading(false);
      };

      document.head.appendChild(script);
    };

    loadMapplsScript();

    // Cleanup function
    return () => {
      if (window.initMap1) {
        delete window.initMap1;
      }
    };
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (mapScriptLoaded && window.mappls) {
      const timer = setTimeout(() => {
        initializeMapplsMap();
      }, 500); // Small delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [mapScriptLoaded, initializeMapplsMap]);

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

  const currentLevel = getUserLevel(userPoints);
  const placesStats = clientPlacesService.getPlacesStats();

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Map Container */}
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative" style={{ minHeight: "600px" }}>
        {mapLoading && !mapError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-12 text-center shadow-2xl border-2 border-white max-w-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-6 border-blue-500 border-t-transparent rounded-full mx-auto mb-8"
              />
              <h3 className="text-3xl font-bold text-slate-800 mb-4">🗺️ Loading Mappls SDK</h3>
              <p className="text-lg text-slate-600 mb-4">JavaScript API • Real Interactive Map</p>
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
        ) : mapError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-12 text-center shadow-2xl border-2 border-white max-w-md">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Map Loading Failed</h3>
              <p className="text-slate-600 mb-4">{mapError}</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600">
                Reload Page
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mappls Map Container */}
            <div 
              ref={mapRef} 
              className="w-full h-full" 
              style={{ minHeight: "600px" }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-30 space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-lg shadow-lg border-2 border-white"
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() + 1);
                  }
                }}
              >
                <Zap className="h-4 w-4 mr-1" />
                Zoom In
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 backdrop-blur-lg shadow-lg border-2 border-white"
                onClick={() => {
                  if (mapInstance) {
                    mapInstance.setZoom(mapInstance.getZoom() - 1);
                  }
                }}
              >
                <Target className="h-4 w-4 mr-1" />
                Zoom Out
              </Button>
            </div>

            {/* Real-time location component */}
            <RealTimeLocation
              onLocationUpdate={(coords) => {
                setUserCoords(coords);
                console.log('📍 User location updated:', coords);
              }}
              isTracking={liveTracking}
              onTrackingChange={setLiveTracking}
              onMovementChange={setUserMoving}
            />
          </>
        )}
      </div>

      {/* Stats Panel */}
      <div className="absolute top-4 right-4 z-30">
        <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-2 border-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Level {currentLevel.level}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP:</span>
              <span className="font-bold text-blue-600">{userPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Visited:</span>
              <span className="font-bold text-green-600">{visitedLocations.length}</span>
            </div>
            <Progress 
              value={(userPoints % 1000) / 10} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Reward Animation */}
      <AnimatePresence>
        {showRewardAnimation && currentReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl text-white text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Awesome!</h2>
              <p className="text-xl mb-4">You visited {currentReward.location}!</p>
              <div className="space-y-2">
                <Badge className="bg-white text-orange-600 text-lg px-4 py-2">
                  +{currentReward.points} XP
                </Badge>
                {currentReward.famous && (
                  <Badge className="bg-yellow-500 text-yellow-900 text-sm px-3 py-1">
                    ⭐ Famous Place Bonus!
                  </Badge>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Place Details */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-4 left-4 right-4 z-40"
          >
            <Card className="bg-white/95 backdrop-blur-lg shadow-xl border-2 border-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPlace.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPlace(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">{selectedPlace.category}</Badge>
                  <p className="text-sm text-slate-600">
                    ⭐ {selectedPlace.rating} • {selectedPlace.xp} XP
                  </p>
                  {visitedLocations.includes(selectedPlace.id) ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✅ Already Visited
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => visitPlace(selectedPlace)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Visit & Earn {selectedPlace.xp} XP
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
