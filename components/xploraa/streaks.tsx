"use client"

import { Flame } from "lucide-react"

export function Streaks() {
  return (
    <section className="rounded-2xl border shadow-sm p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Streak</h3>
        <p className="text-sm text-gray-600">5-day visit streak — keep it going!</p>
      </div>
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-amber-500" aria-hidden />
        <span className="text-lg font-semibold">5</span>
      </div>
    </section>
  )
}
