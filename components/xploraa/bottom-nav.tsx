"use client"

import { Home, Search, Gift, Users, User, Map, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tab = "home" | "map" | "community" | "leaderboard" | "games" | "profile" | "htmlmap" | "character"

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const items = [
    { key: "home" as const, icon: Home, label: "Home" },
    { key: "map" as const, icon: Map, label: "Map" },
    { key: "htmlmap" as const, icon: MapPin, label: "HTML" },
    { key: "character" as const, icon: User, label: "Character" },
    { key: "games" as const, icon: Gift, label: "Games" },
    { key: "profile" as const, icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-xl">
      <div className="mx-auto max-w-md px-2 py-2 pb-safe">
        <div className="grid grid-cols-6 gap-1 items-center">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                "flex flex-col items-center text-xs py-2 px-1 rounded-lg transition-all duration-200",
                active === item.key 
                  ? "text-blue-600 bg-blue-50 font-semibold transform scale-105" 
                  : "text-slate-600 hover:text-blue-500 hover:bg-slate-50",
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
