"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Users, Trophy, Gamepad2, User, MapPin, Megaphone, BookOpen, Newspaper, Star, Map } from "lucide-react"
import Starfield from "./starfield"
import AROverlay from "./ar-overlay"
import BottomNav from "./bottom-nav"
import { GameMap } from "./game-map"
import { UserProfile } from "./user-profile"
import { gameLocations } from "@/lib/mappls-config"

type Tab = "home" | "map" | "community" | "leaderboard" | "games" | "profile"

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "map", label: "Map", icon: Map },
  { key: "community", label: "Community", icon: Users },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "games", label: "Games", icon: Gamepad2 },
  { key: "profile", label: "Profile", icon: User },
]

export default function XploraaAppShell() {
  const [active, setActive] = useState<Tab>("home")

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background: subtle animated starfield */}
      <Starfield className="pointer-events-none absolute inset-0 -z-10 opacity-40" />

      {/* Layout: sidebar on md+, topbar + content */}
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 flex-none border-r border-border/60 bg-card/80 backdrop-blur md:block">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 ring-1 ring-primary/40" />
                <span className="font-serif text-lg font-bold tracking-wide">Xploraa</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Explore. Play. Earn.</p>
            </div>
            <nav className="grid gap-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active === key ? "bg-primary/10 text-primary" : "hover:bg-muted/40",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
            <div className="mt-8 rounded-lg border border-border/60 p-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Today’s Check-ins</p>
                  <p className="text-sm font-medium">3 nearby spots</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-8">
              <div className="flex items-center gap-3 md:hidden">
                <div className="h-6 w-6 rounded-md bg-primary/20 ring-1 ring-primary/40" />
                <span className="font-serif text-base font-bold">Xploraa</span>
              </div>
              <div className="hidden md:block">
                <span className="text-pretty font-serif text-xl font-extrabold">Discover your city</span>
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Beta</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setActive("games")}>
                  <Star className="mr-2 h-4 w-4 text-accent" />
                  Rewards
                </Button>
                <Button size="sm" className="hidden md:inline-flex">
                  Start Exploring
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:px-8">
            {active === "home" && <HomeSection />}
            {active === "community" && <CommunitySection />}
            {active === "leaderboard" && <LeaderboardSection />}
            {active === "games" && <GamesSection />}
            {active === "profile" && <ProfileSection />}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav active={active} onChange={setActive} />
    </div>
  )
}

// Home: matches first dark reference (2x3 grid) + schedule + AR overlay
function HomeSection() {
  return (
    <div className="space-y-6">
      <TilesGrid />
      <section className="grid gap-6 md:grid-cols-2">
        <ScheduleCard />
        <AROverlay />
      </section>
    </div>
  )
}

function TilesGrid() {
  const tiles = useMemo(
    () => [
      { title: "Leaderboard", icon: Trophy, desc: "See top explorers", accent: "text-accent" },
      { title: "Events", icon: Megaphone, desc: "Nearby challenges", accent: "text-primary" },
      { title: "Members", icon: Users, desc: "Your crew", accent: "text-primary" },
      { title: "Courses", icon: BookOpen, desc: "Curated trails", accent: "text-accent" },
      { title: "Announcement", icon: Newspaper, desc: "What’s new", accent: "text-primary" },
      { title: "Feed", icon: Home, desc: "Community posts", accent: "text-accent" },
    ],
    [],
  )
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-pretty font-serif text-lg font-bold">Quick Actions</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          See all
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.title} className="bg-card/70 shadow-sm backdrop-blur">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <t.icon className={cn("h-4 w-4", t.accent)} />
                <CardTitle className="text-sm">{t.title}</CardTitle>
              </div>
              <CardDescription className="text-xs">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="secondary" size="sm" className="w-full">
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
        <CardTitle className="text-sm">My Schedule</CardTitle>
        <CardDescription>Next 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
          <div>
            <p className="text-sm font-medium">Treasure Hunt at Riverwalk</p>
            <p className="text-xs text-muted-foreground">Today • 5:30 PM • 1.2 km</p>
          </div>
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
          <div>
            <p className="text-sm font-medium">Partner Check-in: Bean Bar</p>
            <p className="text-xs text-muted-foreground">Today • 8:00 PM • Coffee King bonus</p>
          </div>
          <Button size="sm" variant="outline">
            Navigate
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/diverse-user-avatars.png" alt="A" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar className="h-6 w-6">
            <AvatarImage src="/diverse-user-avatars.png" alt="B" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">Friends joining: 2</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Community
function CommunitySection() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-card/70 shadow-sm backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`/diverse-professional-profiles.png?height=32&width=32&query=profile%20${i + 1}`}
                  alt="profile"
                />
                <AvatarFallback>XP</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">Explorer {i + 1}</CardTitle>
                <CardDescription className="text-xs">2h ago • Old Town</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Found a mystery spot and earned <span className="font-semibold text-accent">+25 coins</span>!
            </p>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <img src="/city-photo.png" alt="City" className="h-40 w-full object-cover" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                Like
              </Button>
              <Button size="sm" variant="outline">
                Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Leaderboard
function LeaderboardSection() {
  const rows = [
    { name: "Aarav", pts: 1240, title: "Coffee King" },
    { name: "Zoya", pts: 1180, title: "Book Explorer" },
    { name: "Kabir", pts: 1030, title: "Trail Blazer" },
  ]
  return (
    <Card className="bg-card/70 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm">Leaderboard</CardTitle>
        <CardDescription>This week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center justify-between rounded-md border border-border/60 p-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.title}</p>
              </div>
            </div>
            <span className="text-sm font-semibold">{r.pts} pts</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Games: mini spin + scratch placeholders
function GamesSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm">Spin the Wheel</CardTitle>
          <CardDescription>Check-in to spin and win</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto aspect-square w-48 rounded-full border-4 border-accent">
            <div className="animate-[spin_6s_linear_infinite] absolute inset-4 rounded-full border-2 border-dashed border-primary/50" />
            <div className="absolute inset-0 grid place-items-center">
              <Button size="sm" variant="secondary">
                Spin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm">Scratch Card</CardTitle>
          <CardDescription>Reveal your reward</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border/60">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              Reward: +10 green points
            </div>
            <div className="animate-[pulse_2s_ease-in-out_infinite] absolute inset-0 bg-muted/70" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary">
              Scratch
            </Button>
            <Button size="sm" variant="outline">
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile with badges
function ProfileSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader className="flex-row items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/diverse-avatars.png" alt="You" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">You</CardTitle>
            <CardDescription>Streak: 6 days • Level 3</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            Green points: <span className="font-semibold text-accent">180</span>
          </p>
          <p className="text-sm">City: Mumbai</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm">Badges</CardTitle>
          <CardDescription>Limited editions</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {["Coffee King", "Book Explorer", "Santa 2025"].map((b) => (
            <div key={b} className="grid place-items-center rounded-lg border border-border/60 p-3">
              <Star className="mb-2 h-5 w-5 text-accent" />
              <span className="text-center text-xs">{b}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
