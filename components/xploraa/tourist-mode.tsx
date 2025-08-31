"use client"

import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TouristMode() {
  return (
    <section className="rounded-2xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Tourist Mode</h3>
        <Compass className="h-5 w-5 text-teal-600" />
      </div>
      <p className="text-sm text-gray-600 mb-3">Must explore 5 spots to unlock the City Starter badge.</p>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="bg-teal-600 h-full w-2/5" aria-label="Progress 2 of 5" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">Progress: 2/5</p>
        <Button variant="outline" className="text-teal-700 border-teal-200 hover:bg-teal-50 bg-transparent">
          View Map
        </Button>
      </div>
    </section>
  )
}
