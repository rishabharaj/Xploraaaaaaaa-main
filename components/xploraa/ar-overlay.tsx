"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Coin = { id: string; x: number; y: number; size: number }

export function AROverlay() {
  const [coins, setCoins] = useState<Coin[]>([])
  useEffect(() => {
    // seed a few floating "coins"
    const c = Array.from({ length: 7 }).map((_, i) => ({
      id: String(i),
      x: Math.random() * 85 + 5,
      y: Math.random() * 60 + 10,
      size: Math.random() * 22 + 16,
    }))
    setCoins(c)
  }, [])

  return (
    <Card className="bg-card/70 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm">AR Map View</CardTitle>
        <CardDescription>Floating rewards nearby</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-48 overflow-hidden rounded-lg border border-border/60">
          {/* Map placeholder */}
          <img
            src="/abstract-city-map.png"
            alt="City map preview"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          {/* Floating coins/coupons */}
          <div className="absolute inset-0">
            {coins.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "absolute rounded-full border-2 border-accent bg-accent/90 shadow-lg",
                  "animate-[float_3s_ease-in-out_infinite] cursor-pointer hover:scale-110 transition-transform",
                )}
                style={{
                  top: `${c.y}%`,
                  left: `${c.x}%`,
                  width: c.size,
                  height: c.size,
                  animationDelay: `${c.id * 0.4}s`,
                }}
                aria-label="Reward coin"
              />
            ))}
          </div>
          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </div>
      </CardContent>
    </Card>
  )
}

export default AROverlay
