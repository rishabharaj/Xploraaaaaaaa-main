"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  MapPin, 
  Coffee, 
  Calendar, 
  TrendingUp,
  Gift,
  Flame,
  Target,
  Crown,
  Medal,
  Zap,
  Heart,
  Camera,
  ShoppingBag,
  Edit,
  Settings
} from "lucide-react";
import { 
  achievements, 
  getUserLevel, 
  gameLocations 
} from "@/lib/mappls-config";

interface UserStats {
  totalPoints: number;
  visitedLocations: string[];
  streak: number;
  totalCoupons: number;
  favoriteCategory: string;
  joinDate: string;
  totalDistance: number;
}

interface UserProfileProps {
  userStats: UserStats;
  onEditProfile?: () => void;
}

export function UserProfile({ userStats, onEditProfile }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const currentLevel = getUserLevel(userStats.totalPoints);
  const nextLevel = getUserLevel(userStats.totalPoints + 1);
  const progressToNext = nextLevel.level !== currentLevel.level 
    ? ((userStats.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const unlockedAchievements = Object.entries(achievements).filter(([key, achievement]) => {
    switch (key) {
      case "firstVisit":
        return userStats.visitedLocations.length >= 1;
      case "coffeeExplorer":
        return userStats.visitedLocations.filter(id => 
          gameLocations.find(loc => loc.id === id)?.type === "cafe"
        ).length >= 3;
      case "weekendWarrior":
        return userStats.visitedLocations.length >= 5;
      case "localLegend":
        return userStats.visitedLocations.length >= gameLocations.length;
      default:
        return false;
    }
  });

  const visitedLocationDetails = gameLocations.filter(loc => 
    userStats.visitedLocations.includes(loc.id)
  );

  const categoryStats = gameLocations.reduce((acc, location) => {
    acc[location.type] = (acc[location.type] || 0) + 
      (userStats.visitedLocations.includes(location.id) ? 1 : 0);
    return acc;
  }, {} as Record<string, number>);

  const recentActivity = [
    { type: "visit", location: "Coffee Culture", points: 100, time: "2 hours ago" },
    { type: "achievement", name: "Coffee Explorer", points: 300, time: "1 day ago" },
    { type: "coupon", discount: "20% OFF", location: "Cafe Terazzo", time: "2 days ago" },
    { type: "streak", days: 5, points: 50, time: "3 days ago" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-20 h-20 border-4 border-white/20">
                  <AvatarImage src="/diverse-user-avatars.png" alt="Profile" />
                  <AvatarFallback className="bg-purple-400 text-purple-900 text-xl font-bold">
                    XP
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <Crown className="w-4 h-4 text-purple-600" />
                </motion.div>
              </motion.div>
              
              <div>
                <h1 className="text-3xl font-bold mb-1">Xplorer Gamer</h1>
                <p className="text-white/80 mb-2">Indore Explorer since {userStats.joinDate}</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    className="px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: currentLevel.color }}
                  >
                    Level {currentLevel.level} • {currentLevel.name}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {userStats.streak} day streak 🔥
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onEditProfile}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{userStats.totalPoints} / {nextLevel.minPoints} XP</span>
            </div>
            <Progress value={progressToNext} className="h-3 bg-white/20" />
            <p className="text-xs text-white/80">
              {nextLevel.minPoints - userStats.totalPoints} XP until {nextLevel.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Total Points</span>
          </div>
          <p className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Places Visited</span>
          </div>
          <p className="text-2xl font-bold">{userStats.visitedLocations.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Coupons Earned</span>
          </div>
          <p className="text-2xl font-bold">{userStats.totalCoupons}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-red-400 to-yellow-500 rounded-lg text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <p className="text-2xl font-bold">{userStats.streak} days</p>
        </motion.div>
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Exploration Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const icons = { cafe: Coffee, landmark: Camera, shopping: ShoppingBag };
                  const Icon = icons[category as keyof typeof icons] || MapPin;
                  const colors = { cafe: "bg-amber-500", landmark: "bg-blue-500", shopping: "bg-purple-500" };
                  const color = colors[category as keyof typeof colors] || "bg-gray-500";
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${color} rounded-lg text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="capitalize font-medium">{category}</span>
                      </div>
                      <Badge variant="secondary">{count} visited</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Latest Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unlockedAchievements.slice(0, 3).map(([key, achievement]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge className="ml-auto bg-yellow-400 text-yellow-900">
                        +{achievement.points}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievement Collection
                </span>
                <Badge variant="secondary">
                  {unlockedAchievements.length} / {Object.keys(achievements).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(achievements).map(([key, achievement]) => {
                  const isUnlocked = unlockedAchievements.some(([unlockedKey]) => unlockedKey === key);
                  
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 ${
                        isUnlocked 
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300" 
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isUnlocked ? "" : "grayscale"}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{achievement.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={isUnlocked ? "default" : "secondary"}
                              className={isUnlocked ? "bg-yellow-400 text-yellow-900" : ""}
                            >
                              {achievement.points} points
                            </Badge>
                            {isUnlocked && (
                              <Badge variant="outline" className="text-green-600 border-green-300">
                                ✅ Unlocked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Visited Locations ({visitedLocationDetails.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitedLocationDetails.map((location) => (
                  <motion.div
                    key={location.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold mb-1">{location.name}</h3>
                        <Badge 
                          variant="secondary"
                          className="capitalize"
                        >
                          {location.type}
                        </Badge>
                      </div>
                      <div className="text-2xl">
                        {{
                          cafe: "☕",
                          landmark: "🏛️", 
                          shopping: "🛍️"
                        }[location.type] || "📍"}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{location.rewards.points} points earned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-500" />
                        <span className="text-xs">{location.rewards.coupon}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span className="text-xs">{location.rewards.badge}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {visitedLocationDetails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No locations visited yet. Start exploring to unlock rewards!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                      {activity.type === "visit" && <MapPin className="w-5 h-5" />}
                      {activity.type === "achievement" && <Trophy className="w-5 h-5" />}
                      {activity.type === "coupon" && <Gift className="w-5 h-5" />}
                      {activity.type === "streak" && <Flame className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      {activity.type === "visit" && (
                        <p className="font-medium">
                          Visited {activity.location} • +{activity.points} points
                        </p>
                      )}
                      {activity.type === "achievement" && (
                        <p className="font-medium">
                          Unlocked "{activity.name}" achievement • +{activity.points} points
                        </p>
                      )}
                      {activity.type === "coupon" && (
                        <p className="font-medium">
                          Earned coupon: {activity.discount} at {activity.location}
                        </p>
                      )}
                      {activity.type === "streak" && (
                        <p className="font-medium">
                          {activity.days} day streak milestone • +{activity.points} points
                        </p>
                      )}
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}