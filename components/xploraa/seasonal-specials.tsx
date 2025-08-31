"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SeasonalSpecials() {
  const [diwali, setDiwali] = useState(true)
  const [christmas, setChristmas] = useState(false)

  return (
    <section className="rounded-2xl border shadow-sm p-4">
      <h3 className="font-semibold mb-3">Festival Specials</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Diwali Treasure Lights</p>
            <p className="text-xs text-gray-600">Treasure spots glow across the map</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="diwali" className="sr-only">
              Enable Diwali
            </Label>
            <Switch id="diwali" checked={diwali} onCheckedChange={setDiwali} aria-label="Enable Diwali special" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Christmas Santa Badges</p>
            <p className="text-xs text-gray-600">Collect limited Santa-themed badges</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="christmas" className="sr-only">
              Enable Christmas
            </Label>
            <Switch
              id="christmas"
              checked={christmas}
              onCheckedChange={setChristmas}
              aria-label="Enable Christmas special"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
