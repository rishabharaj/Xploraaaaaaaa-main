"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, Zap, Gift, Clock, Phone, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { realPlacesService, type RealPlace } from '@/lib/real-places-service';

interface RealTimeLocationProps {
  userLocation: [number, number] | null;
  onPlaceSelect: (place: RealPlace) => void;
  onLocationVisit: (placeId: string, xpPoints: number) => void;
  isMoving: boolean;
}

export function RealTimeLocation({ 
  userLocation, 
  onPlaceSelect, 
  onLocationVisit, 
  isMoving 
}: RealTimeLocationProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<RealPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<RealPlace | null>(null);
  const [userMovement, setUserMovement] = useState({ speed: 0, direction: 'N' });
  const [lastLocation, setLastLocation] = useState<[number, number] | null>(null);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);

  // Track user movement
  useEffect(() => {
    if (userLocation && lastLocation) {
      const distance = realPlacesService.calculateDistance(lastLocation, userLocation);
      const timeDiff = 5; // Assume 5 seconds between updates
      const speed = (distance * 3600) / timeDiff; // km/h
      
      // Calculate direction (simplified)
      const direction = userLocation[1] > lastLocation[1] ? 'N' : 
                       userLocation[1] < lastLocation[1] ? 'S' : 
                       userLocation[0] > lastLocation[0] ? 'E' : 'W';
      
      setUserMovement({ speed: Math.round(speed), direction });
    }
    setLastLocation(userLocation);
    setLocationUpdateCount(prev => prev + 1);
  }, [userLocation, lastLocation]);

  // Fetch nearby places when user location changes
  const fetchNearbyPlaces = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      console.log('🔄 Fetching nearby places for:', userLocation);
      const places = await realPlacesService.getNearbyPlaces(userLocation, 3); // 3km radius
      setNearbyPlaces(places);
      console.log(`📍 Found ${places.length} nearby places`);
    } catch (error) {
      console.error('❌ Error fetching nearby places:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Fetch places when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces();
    }
  }, [userLocation, fetchNearbyPlaces]);

  // Check for place visits (within 100m)
  useEffect(() => {
    if (!userLocation || !nearbyPlaces.length) return;

    nearbyPlaces.forEach(place => {
      const distance = realPlacesService.calculateDistance(userLocation, place.coordinates);
      if (distance <= 0.1) { // Within 100 meters
        console.log(`🎯 User visited: ${place.name} (+${place.xpPoints} XP)`);
        onLocationVisit(place.id, place.xpPoints);
      }
    });
  }, [userLocation, nearbyPlaces, onLocationVisit]);

  // Get place type icon
  const getPlaceIcon = (type: RealPlace['type']) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'cafe': return '☕';
      case 'gym': return '💪';
      case 'bar': return '🍺';
      case 'hotel': return '🏨';
      case 'parlour': return '💅';
      default: return '📍';
    }
  };

  // Get fame color
  const getFameColor = (level: RealPlace['famousLevel']) => {
    switch (level) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'famous': return 'text-orange-600 bg-orange-100';
      case 'popular': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="space-y-4">
      {/* User Location Status */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MapPin className="w-5 h-5 text-green-600" />
                {isMoving && (
                  <motion.div
                    className="absolute -inset-1 border-2 border-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-green-800">Live Location Active</p>
                <p className="text-xs text-gray-600">
                  {userLocation[1].toFixed(4)}°N, {userLocation[0].toFixed(4)}°E
                </p>
              </div>
            </div>
            <div className="text-right">
              {isMoving && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Navigation className="w-3 h-3" />
                  <span>{userMovement.speed} km/h {userMovement.direction}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">Updates: {locationUpdateCount}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nearby Places */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Nearby Rewards ({nearbyPlaces.length})
            </h3>
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {nearbyPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedPlace(place);
                  onPlaceSelect(place);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{getPlaceIcon(place.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{place.name}</h4>
                        <Badge className={`text-xs px-2 py-1 ${getFameColor(place.famousLevel)}`}>
                          {place.famousLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{place.rating} ({place.totalRatings})</span>
                        </div>
                        {place.distance && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs text-blue-600">
                              {formatDistance(place.distance)}
                            </span>
                          </>
                        )}
                        {place.isOpen !== undefined && (
                          <>
                            <span className="text-gray-400">•</span>
                            <Badge variant={place.isOpen ? "default" : "destructive"} className="text-xs">
                              {place.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-2">{place.address}</p>

                      {place.specialRewards && place.specialRewards.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {place.specialRewards.map((reward, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Gift className="w-3 h-3 mr-1" />
                              {reward.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg text-yellow-600">
                        {place.xpPoints}
                      </span>
                      <span className="text-xs text-gray-500">XP</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {'💰'.repeat(place.priceLevel)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLoading && nearbyPlaces.length === 0 && userLocation && (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm">No places found nearby</p>
              <p className="text-xs">Try moving to a different area</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Place Details */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <span className="text-3xl">{getPlaceIcon(selectedPlace.type)}</span>
                  {selectedPlace.name}
                </h3>
                <Badge className={`mt-2 ${getFameColor(selectedPlace.famousLevel)}`}>
                  {selectedPlace.famousLevel.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlace(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{selectedPlace.rating}/5 ({selectedPlace.totalRatings} reviews)</span>
                </div>
                {selectedPlace.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{selectedPlace.phone}</span>
                  </div>
                )}
                {selectedPlace.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Website</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold text-2xl text-yellow-600">
                    {selectedPlace.xpPoints}
                  </span>
                  <span className="text-sm text-gray-500">XP</span>
                </div>
                <p className="text-sm text-gray-600">
                  Price: {'💰'.repeat(selectedPlace.priceLevel)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{selectedPlace.address}</p>

            {selectedPlace.specialRewards && selectedPlace.specialRewards.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-500" />
                  Special Rewards
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlace.specialRewards.map((reward, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      {reward.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" size="sm">
                🧭 Navigate Here
              </Button>
              <Button variant="outline" size="sm">
                ⭐ Save Place
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
