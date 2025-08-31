"use client"

import { Trophy, Crown } from "lucide-react"

export function Leaderboard() {
  const entries = [
    { name: "You", points: 1240, title: "Coffee King", me: true },
    { name: "A. K.", points: 1190, title: "Book Explorer" },
    { name: "P. S.", points: 980, title: "Trail Tactician" },
  ]
  return (
    <section className="rounded-2xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Leaderboard</h3>
        <Trophy className="h-5 w-5 text-teal-600" />
      </div>
      <ul className="space-y-2">
        {entries.map((e, i) => (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" aria-hidden />
              <div>
                <p className="text-sm font-medium">
                  {e.name} {e.me && <span className="sr-only">(You)</span>}
                </p>
                <p className="text-xs text-gray-500">{e.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {i === 0 && <Crown className="h-4 w-4 text-amber-500" aria-label="Top rank" />}
              <span className="text-sm font-semibold">{e.points}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
