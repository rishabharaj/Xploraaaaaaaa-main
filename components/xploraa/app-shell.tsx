"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Users, Trophy, Gamepad2, User, MapPin, Megaphone, BookOpen, Newspaper, Star, Map, Gift, Zap } from "lucide-react"
import Starfield from "./starfield"
import AROverlay from "./ar-overlay"
import BottomNav from "./bottom-nav"
import { GameMap } from "./working-mappls-map"
import { UserProfile } from "./user-profile"
import SpinWheel from "./spin-wheel"
import ScratchCard from "./scratch-card"
import { gameLocations, achievements } from "@/lib/mappls-config"

type Tab = "home" | "map" | "community" | "leaderboard" | "games" | "profile" | "htmlmap" | "character"

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "map", label: "Map", icon: Map },
  { key: "htmlmap", label: "HTML Map", icon: MapPin },
  { key: "character", label: "Character", icon: User },
  { key: "community", label: "Community", icon: Users },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "games", label: "Games", icon: Gamepad2 },
  { key: "profile", label: "Profile", icon: User },
]

export default function XploraaAppShell() {
  const [active, setActive] = useState<Tab>("home")
  const [userPoints, setUserPoints] = useState(1250)
  const [visitedLocations, setVisitedLocations] = useState<string[]>(["cafe-1", "landmark-1"])
  const [userStreak, setUserStreak] = useState(6)
  const [totalCoupons, setTotalCoupons] = useState(8)

  // Handle location visits from the game map
  const handleLocationVisit = (locationId: string, points: number) => {
    if (!visitedLocations.includes(locationId)) {
      setVisitedLocations(prev => [...prev, locationId])
      setUserPoints(prev => prev + points)
      setTotalCoupons(prev => prev + 1)
      
      // Update streak logic (simplified)
      setUserStreak(prev => prev + 1)
    }
  }

  // User stats for profile
  const userStats = {
    totalPoints: userPoints,
    visitedLocations: visitedLocations,
    streak: userStreak,
    totalCoupons: totalCoupons,
    favoriteCategory: "cafe",
    joinDate: "Jan 2024",
    totalDistance: 12.5
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Background: improved gradient with better colors */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />
      <Starfield className="pointer-events-none absolute inset-0 -z-10 opacity-20" />

      {/* Layout: sidebar on md+, topbar + content */}
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar (desktop) - Enhanced colors */}
        <aside className="hidden w-64 flex-none border-r border-slate-200 bg-white/90 backdrop-blur-lg shadow-lg md:block">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 ring-2 ring-blue-200" />
                <span className="font-bold text-xl tracking-wide text-slate-800">Xploraa</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 font-medium">Explore. Play. Earn.</p>
            </div>
            <nav className="grid gap-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    active === key 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105" 
                      : "hover:bg-slate-100 text-slate-700 hover:text-slate-900 hover:scale-102",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>
            
            {/* User Stats in Sidebar - Enhanced colors */}
            <div className="mt-8 space-y-3">
              <div className="rounded-xl border-2 border-emerald-200 p-4 bg-gradient-to-r from-emerald-50 to-green-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-full">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Locations Visited</p>
                    <p className="text-lg font-bold text-emerald-800">{visitedLocations.length} / {gameLocations.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border-2 border-amber-200 p-4 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-full">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">Points Earned</p>
                    <p className="text-lg font-bold text-amber-800">{userPoints.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border-2 border-rose-200 p-4 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-full">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-700 font-semibold uppercase tracking-wide">Current Streak</p>
                    <p className="text-lg font-bold text-rose-800">{userStreak} days 🔥</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar - Enhanced styling */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-lg shadow-sm">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
              <div className="flex items-center gap-3 md:hidden">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 ring-2 ring-blue-200" />
                <span className="font-bold text-base text-slate-800">Xploraa</span>
              </div>
              <div className="hidden md:block">
                <span className="text-pretty font-bold text-2xl text-slate-800">
                  {active === "map" && "🗺️ Gamified Map Explorer"}
                  {active === "profile" && "👤 Your Gaming Profile"}
                  {active === "home" && "🏠 Discover Indore"}
                  {active === "community" && "👥 Explorer Community"}
                  {active === "leaderboard" && "🏆 Top Explorers"}
                  {active === "games" && "🎮 Reward Games"}
                </span>
                <span className="ml-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs text-white font-semibold shadow-lg">
                  Indore Edition
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setActive("games")}
                  className="hidden md:flex bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 border border-amber-300 text-amber-800"
                >
                  <Star className="mr-2 h-4 w-4 text-amber-600" />
                  <span className="font-bold">{userPoints}</span>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg border-0"
                  onClick={() => setActive("map")}
                >
                  🚀 Start Exploring
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className={cn(
            "mx-auto w-full flex-1",
            active === "map" || active === "htmlmap" ? "max-w-full px-0 py-0" : "max-w-4xl px-4 py-6 md:px-8"
          )}>
            {active === "home" && <HomeSection userStats={userStats} onNavigate={setActive} />}
            {active === "map" && (
              <div className="h-screen w-full">
                <GameMap
                  userPoints={userPoints}
                  onLocationVisit={handleLocationVisit}
                  visitedLocations={visitedLocations}
                />
              </div>
            )}
            {active === "htmlmap" && (
              <div className="h-screen w-full">
                <iframe 
                  src="/mappls-map.html" 
                  className="w-full h-full border-none"
                  title="Mappls Interactive Map"
                />
              </div>
            )}
            {active === "character" && (
              <div className="h-screen w-full">
                <iframe 
                  src="/animated-character.html" 
                  className="w-full h-full border-none"
                  title="Animated Character Map"
                />
              </div>
            )}
            {active === "community" && <CommunitySection />}
            {active === "leaderboard" && <LeaderboardSection userPoints={userPoints} />}
            {active === "games" && <GamesSection userPoints={userPoints} totalCoupons={totalCoupons} onPointsUpdate={setUserPoints} />}
            {active === "profile" && (
              <UserProfile 
                userStats={userStats}
                onEditProfile={() => console.log("Edit profile")}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav active={active} onChange={setActive} />
    </div>
  )
}

// Home: matches first dark reference (2x3 grid) + schedule + AR overlay + gamified elements
function HomeSection({ userStats, onNavigate }: { userStats: any; onNavigate: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Explorer! 🎮</h1>
              <p className="text-white/80 mb-4">Ready to discover more of Indore today?</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">{userStats.totalPoints} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="font-bold">{userStats.streak} day streak</span>
                </div>
              </div>
            </div>
            <div className="text-4xl">🗺️</div>
          </div>
        </CardContent>
      </Card>

      <TilesGrid onNavigate={onNavigate} />
      <section className="grid gap-6 md:grid-cols-2">
        <ScheduleCard />
        <AROverlay />
      </section>
    </div>
  )
}

function TilesGrid({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const tiles = useMemo(
    () => [
      { title: "🏆 Leaderboard", desc: "See top explorers", accent: "text-yellow-600", bg: "from-yellow-50 to-orange-50", tab: "leaderboard" as Tab },
      { title: "🗺️ Explore Map", desc: "Find nearby rewards", accent: "text-blue-600", bg: "from-blue-50 to-indigo-50", tab: "map" as Tab },
      { title: "👥 Community", desc: "Join explorers", accent: "text-purple-600", bg: "from-purple-50 to-pink-50", tab: "community" as Tab },
      { title: "🎮 Play Games", desc: "Spin & win rewards", accent: "text-green-600", bg: "from-green-50 to-emerald-50", tab: "games" as Tab },
      { title: "🏅 Achievements", desc: "Track progress", accent: "text-indigo-600", bg: "from-indigo-50 to-purple-50", tab: "profile" as Tab },
      { title: "🎁 Rewards", desc: "Claim coupons", accent: "text-red-600", bg: "from-red-50 to-pink-50", tab: "profile" as Tab },
    ],
    [],
  )
  
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-pretty font-serif text-lg font-bold">🚀 Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.title} className={`bg-gradient-to-r ${t.bg} shadow-sm backdrop-blur hover:shadow-lg transition-all cursor-pointer`} onClick={() => onNavigate(t.tab)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">{t.title}</CardTitle>
              <CardDescription className="text-xs">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="secondary" size="sm" className="w-full font-medium">
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ScheduleCard() {
  return (
    <Card className="bg-card/70 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          📅 Today's Adventures
        </CardTitle>
        <CardDescription>Recommended for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3">
          <div>
            <p className="text-sm font-medium">☕ Visit Coffee Culture</p>
            <p className="text-xs text-muted-foreground">0.8 km away • 100 XP + 10% OFF coupon</p>
          </div>
          <Button size="sm" variant="outline" className="bg-green-100 border-green-300 text-green-700">
            Navigate
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-3">
          <div>
            <p className="text-sm font-medium">🏛️ Explore Rajwada Palace</p>
            <p className="text-xs text-muted-foreground">1.2 km away • 250 XP + Heritage Hunter badge</p>
          </div>
          <Button size="sm" variant="outline" className="bg-blue-100 border-blue-300 text-blue-700">
            View
          </Button>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/diverse-user-avatars.png" alt="A" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar className="h-6 w-6">
            <AvatarImage src="/diverse-user-avatars.png" alt="B" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">2 friends are exploring nearby! 👋</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Community
function CommunitySection() {
  const communityPosts = [
    { user: "Aarav K.", location: "Coffee Culture", activity: "Earned Coffee Explorer badge", points: 300, time: "2h ago", avatar: "/diverse-professional-profiles.png" },
    { user: "Priya S.", location: "Rajwada Palace", activity: "Completed heritage trail", points: 500, time: "4h ago", avatar: "/diverse-user-avatars.png" },
    { user: "Rahul M.", location: "Phoenix Mall", activity: "Shopping spree reward unlocked", points: 180, time: "6h ago", avatar: "/diverse-avatars.png" },
  ]

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🌟 Community Highlights
          </CardTitle>
          <CardDescription>See what fellow explorers are up to!</CardDescription>
        </CardHeader>
      </Card>

      {communityPosts.map((post, i) => (
        <Card key={i} className="bg-card/70 shadow-sm backdrop-blur hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-purple-200">
                <AvatarImage src={post.avatar} alt="profile" />
                <AvatarFallback className="bg-purple-100 text-purple-600">{post.user[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-bold">{post.user}</CardTitle>
                <CardDescription className="text-xs">{post.time} • {post.location}</CardDescription>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-bold text-orange-600">+{post.points}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              🎉 {post.activity}! 
              <span className="font-semibold text-purple-600 ml-1">+{post.points} XP earned</span>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-purple-50 text-purple-600 hover:bg-purple-100">
                👏 Celebrate
              </Button>
              <Button size="sm" variant="outline">
                💬 Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Enhanced Leaderboard
function LeaderboardSection({ userPoints }: { userPoints: number }) {
  const leaderboardData = [
    { rank: 1, name: "Aarav Sharma", pts: 2840, title: "Local Legend", streak: 12, badge: "👑" },
    { rank: 2, name: "Priya Gupta", pts: 2650, title: "Explorer Elite", streak: 8, badge: "🏆" },
    { rank: 3, name: "Rahul Verma", pts: 2430, title: "Adventure King", streak: 15, badge: "🥉" },
    { rank: 4, name: "Sneha Patel", pts: 2210, title: "Trail Blazer", streak: 6, badge: "🌟" },
    { rank: 5, name: "You", pts: userPoints, title: "Rising Star", streak: 6, badge: "🚀" },
  ]

  return (
    <div className="space-y-6">
      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">🏆 Weekly Challenge</h2>
          <p className="text-white/90 mb-3">Visit 10 different locations to win the "Explorer Elite" badge!</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${(5/10) * 100}%` }}></div>
            </div>
            <span className="font-bold">5/10</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              🏆 Leaderboard
            </span>
            <span className="text-sm font-normal text-muted-foreground">This Week</span>
          </CardTitle>
          <CardDescription>Top explorers in Indore</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((player) => (
            <div key={player.rank} className={`flex items-center justify-between rounded-lg p-4 border transition-all ${
              player.name === "You" 
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border-purple-300 shadow-md" 
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{player.badge}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm font-bold text-white">
                    {player.rank}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.title} • {player.streak} day streak 🔥</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">{player.pts.toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Games Section with animations
function GamesSection({ userPoints, totalCoupons, onPointsUpdate }: { userPoints: number; totalCoupons: number; onPointsUpdate: (points: number) => void }) {
  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">🎮 Your Rewards Hub</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{userPoints.toLocaleString()}</div>
              <div className="text-white/80 text-sm">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalCoupons}</div>
              <div className="text-white/80 text-sm">Coupons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-white/80 text-sm">Badges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Spin Wheel */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🎡 Daily Spin Wheel
            </CardTitle>
            <CardDescription>Free spin every 24 hours!</CardDescription>
          </CardHeader>
          <CardContent>
            <SpinWheel onReward={(reward) => {
              onPointsUpdate(userPoints + reward.points)
            }} />
          </CardContent>
        </Card>

        {/* Scratch Card */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🎫 Scratch & Win
            </CardTitle>
            <CardDescription>Scratch to reveal prizes!</CardDescription>
          </CardHeader>
          <CardContent>
            <ScratchCard onReveal={(prize) => {
              onPointsUpdate(userPoints + prize.points)
            }} />
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenges */}
      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            🎯 Daily Challenges
          </CardTitle>
          <CardDescription>Complete these to earn bonus rewards!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { task: "Visit 2 cafes", progress: 1, total: 2, reward: "150 XP + Coffee Lover badge", completed: false },
            { task: "Take 5 photos at landmarks", progress: 3, total: 5, reward: "200 XP + Photography Pro badge", completed: false },
            { task: "Check in during peak hours", progress: 1, total: 1, reward: "100 XP + Early Bird coupon", completed: true },
          ].map((challenge, i) => (
            <div key={i} className={`p-3 rounded-lg border ${challenge.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{challenge.task}</p>
                <div className="text-sm">
                  {challenge.completed ? (
                    <span className="text-green-600 font-bold">✅ Completed</span>
                  ) : (
                    <span className="text-gray-600">{challenge.progress}/{challenge.total}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">🎁 {challenge.reward}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
